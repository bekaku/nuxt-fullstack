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
import { nextId } from '#server/utils/snowflake'

const connectionString = process.env.NUXT_DATABASE_URL
if (!connectionString) {
  throw new Error('NUXT_DATABASE_URL is not set. Copy .env.example to .env first.')
}

const client = postgres(connectionString, { max: 1 })
const db = drizzle(client, { schema })

// Permission code convention: "<table_name>_<action>"
const RESOURCES = ['app_user', 'app_role', 'permission', 'api_client'] as const
const ACTIONS = ['list', 'view', 'add', 'edit', 'delete'] as const

async function main() {
  console.log('🌱 Seeding database...')

  // 1) Permissions: Create all resources x actions.
  const permissionRows = RESOURCES.flatMap((resource) =>
    ACTIONS.map((action) => ({
      id: nextId(),
      code: `${resource}_${action}`,
      operationType: action === 'list' || action === 'view' ? 0 : action === 'delete' ? 2 : 1,
      module: resource,
      description: `${action} ${resource}`,
    })),
  )

  const insertedPermissions = await db
    .insert(schema.permission)
    .values(permissionRows)
    .onConflictDoNothing()
    .returning()

  const allPermissions =
    insertedPermissions.length > 0 ? insertedPermissions : await db.select().from(schema.permission)

  console.log(`  ✓ permissions: ${allPermissions.length}`)

  // 2) Roles: Admin (all privileges) and Viewer (read-only)
  const [adminRole] = await db
    .insert(schema.appRole)
    .values({ id: nextId(), name: 'Admin', active: true, deleted: false, createdDate: new Date() })
    .returning()

  const [viewerRole] = await db
    .insert(schema.appRole)
    .values({ id: nextId(), name: 'Viewer', active: true, deleted: false, createdDate: new Date() })
    .returning()

  console.log('  ✓ roles: Admin, Viewer')

  // 3) Role <-> Permission mapping
  if (adminRole) {
    await db.insert(schema.rolePermission).values(
      allPermissions.map((p) => ({ appRole: adminRole.id, permission: p.id })),
    )
  }
  if (viewerRole) {
    await db.insert(schema.rolePermission).values(
      allPermissions
        .filter((p) => p.code.endsWith('_list') || p.code.endsWith('_view'))
        .map((p) => ({ appRole: viewerRole.id, permission: p.id })),
    )
  }

  console.log('  ✓ role_permission mapped')

  // 4) Default Admin user (Change password immediately after first login in production)
  const plainPassword = 'Admin@12345'
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(plainPassword, salt)

  const [adminUser] = await db
    .insert(schema.appUser)
    .values({
      id: nextId(),
      email: 'admin@example.com',
      username: 'admin',
      password: hash,
      salt,
      active: true,
      deleted: false,
      defaultLocale: 0,
      createdDate: new Date(),
    })
    .returning()

  if (adminUser && adminRole) {
    await db.insert(schema.appUserRole).values({ appUser: adminUser.id, appRole: adminRole.id })
  }


console.log(' ✓ admin user created')
console.log('')
console.log('=================================================')
console.log(' Login: admin@example.com / admin')
console.log(` Password: ${plainPassword}`)
console.log(' ⚠️ Change this password immediately before use')
console.log('================================================')

  await client.end()
}

main().catch(async (err) => {
  console.error('❌ Seed failed:', err)
  await client.end()
  process.exit(1)
})
