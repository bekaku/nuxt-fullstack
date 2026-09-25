/**
* Run with: npm run db:seed
* This script runs outside the Nuxt runtime (directly via tsx), so it loads the .env file itself using dotenv.
* And creates its own DB connection instead of using useDb()/useRuntimeConfig() which depend on the Nuxt context.
*/
import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import bcrypt from 'bcryptjs'
import * as schema from './schema'
import { and, eq } from 'drizzle-orm'
import { nextId } from '../utils/snowflake'

const connectionString = process.env.NUXT_DATABASE_URL
if (!connectionString) {
  throw new Error('NUXT_DATABASE_URL is not set. Copy .env.example to .env first.')
}

const client = postgres(connectionString, { max: 1 })
const db = drizzle(client, { schema })

// Permission code convention: "<table_name>_<action>"
const RESOURCES = ['app_user', 'app_role', 'permission', 'api_client', 'files_directory', 'file_manager', 'ai_document_meta'] as const
const ACTIONS = ['list', 'view', 'add', 'edit', 'delete'] as const

async function main() {
  console.log('🌱 Seeding database...')
  // Idempotent: safe to run again on an existing database. It only adds what is
  // missing (new permission codes, the Admin/Viewer roles, their grants, and the
  // default admin user). It never changes passwords or removes anything.

  // 1) Permissions: insert only codes that do not exist yet.
  //    (permission.code has no unique constraint, so onConflictDoNothing() cannot detect duplicates.)
  const existingCodes = new Set(
    (await db.select({ code: schema.permission.code }).from(schema.permission)).map((p) => p.code),
  )
  const permissionRows = RESOURCES.flatMap((resource) =>
    ACTIONS.map((action) => ({
      id: nextId(),
      code: `${resource}_${action}`,
      operationType: action === 'list' || action === 'add'|| action === 'view' || action === 'delete' ? ('CRUD' as const) : ('OTHER' as const),
      module: resource,
      description: `${action} ${resource}`,
    })),
  ).filter((row) => !existingCodes.has(row.code))

  if (permissionRows.length > 0) {
    await db.insert(schema.permission).values(permissionRows)
  }
  const seededCodes = new Set<string>(RESOURCES.flatMap((resource) => ACTIONS.map((action) => `${resource}_${action}`)))
  const allPermissions = (await db
    .select({ id: schema.permission.id, code: schema.permission.code })
    .from(schema.permission))
    .filter((p) => seededCodes.has(p.code))

  console.log(`  ✓ permissions: ${permissionRows.length} added, ${allPermissions.length} seeded codes present`)

  // 2) Roles: Admin (all seeded privileges) and Viewer (read-only), created only if missing
  const findOrCreateRole = async (name: string) => {
    const [existing] = await db
      .select({ id: schema.appRole.id })
      .from(schema.appRole)
      .where(and(eq(schema.appRole.name, name), eq(schema.appRole.deleted, false)))
      .limit(1)
    if (existing) {
      return existing
    }
    const [created] = await db
      .insert(schema.appRole)
      .values({ id: nextId(), name, active: true, deleted: false, createdDate: new Date() })
      .returning({ id: schema.appRole.id })
    return created
  }
  const adminRole = await findOrCreateRole('Admin')
  const viewerRole = await findOrCreateRole('Viewer')

  console.log('  ✓ roles: Admin, Viewer')

  // 3) Role <-> Permission mapping (composite PK → existing grants are skipped)
  if (adminRole && allPermissions.length > 0) {
    await db.insert(schema.rolePermission).values(
      allPermissions.map((p) => ({ appRole: adminRole.id, permission: p.id })),
    ).onConflictDoNothing()
  }
  const viewerPermissions = allPermissions.filter((p) => p.code.endsWith('_list') || p.code.endsWith('_view'))
  if (viewerRole && viewerPermissions.length > 0) {
    await db.insert(schema.rolePermission).values(
      viewerPermissions.map((p) => ({ appRole: viewerRole.id, permission: p.id })),
    ).onConflictDoNothing()
  }

  console.log('  ✓ role_permission mapped')

  // 4) Default Admin user (Change password immediately after first login in production)
  const adminEmail = 'admin@example.com'
  const plainPassword = 'Admin@12345'
  const [existingAdmin] = await db
    .select({ id: schema.appUser.id })
    .from(schema.appUser)
    .where(eq(schema.appUser.email, adminEmail))
    .limit(1)

  let adminUser = existingAdmin
  if (!adminUser) {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(plainPassword, salt)
    const [created] = await db
      .insert(schema.appUser)
      .values({
        id: nextId(),
        email: adminEmail,
        username: 'admin',
        password: hash,
        salt,
        active: true,
        deleted: false,
        defaultLocale: 0,
        createdDate: new Date(),
      })
      .returning({ id: schema.appUser.id })
    adminUser = created
  }

  if (adminUser && adminRole) {
    await db
      .insert(schema.appUserRole)
      .values({ appUser: adminUser.id, appRole: adminRole.id })
      .onConflictDoNothing()
  }

  if (existingAdmin) {
    console.log(' ✓ admin user already exists (password unchanged)')
  } else {
    console.log(' ✓ admin user created')
    console.log('')
    console.log('=================================================')
    console.log(` Login: ${adminEmail} / admin`)
    console.log(` Password: ${plainPassword}`)
    console.log(' ⚠️ Change this password immediately before use')
    console.log('================================================')
  }

  await client.end()
}

main().catch(async (err) => {
  console.error('❌ Seed failed:', err)
  await client.end()
  process.exit(1)
})
