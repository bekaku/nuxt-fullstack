import { relations } from 'drizzle-orm'
import {
  AnyPgColumn,
  bigint,
  boolean,
  check,
  doublePrecision,
  index,
  integer,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

/**
* Note regarding Primary Key
* The original data in starter_postgres.sql uses a Snowflake/TSID bigint (e.g., 350885844724224000).
* This is not a regular bigserial, so the mode is set to 'bigint' and the app is allowed to generate the ID itself.
* This is done via server/utils/snowflake.ts (see usage in seed.ts and API routes).
*/
const id = () => bigint('id', { mode: 'bigint' }).primaryKey()

// ---------------------------------------------------------------------------
// Reference / Location tables
// ---------------------------------------------------------------------------

export const province = pgTable('province', {
  id: id(),
  deleted: boolean('deleted'),
  createdDate: timestamp('created_date', { precision: 6 }),
  createdUser: bigint('created_user', { mode: 'bigint' }),
  updatedDate: timestamp('updated_date', { precision: 6 }),
  updatedUser: bigint('updated_user', { mode: 'bigint' }),
  name: varchar('name', { length: 255 }),
  nameEn: varchar('name_en', { length: 255 }),
})

export const district = pgTable('district', {
  id: id(),
  deleted: boolean('deleted'),
  createdDate: timestamp('created_date', { precision: 6 }),
  createdUser: bigint('created_user', { mode: 'bigint' }),
  updatedDate: timestamp('updated_date', { precision: 6 }),
  updatedUser: bigint('updated_user', { mode: 'bigint' }),
  name: varchar('name', { length: 255 }).notNull(),
  nameEn: varchar('name_en', { length: 255 }),
  province: bigint('province', { mode: 'bigint' })
    .notNull()
    .references(() => province.id),
})

export const subDistrict = pgTable('sub_district', {
  id: id(),
  deleted: boolean('deleted'),
  createdDate: timestamp('created_date', { precision: 6 }),
  createdUser: bigint('created_user', { mode: 'bigint' }),
  updatedDate: timestamp('updated_date', { precision: 6 }),
  updatedUser: bigint('updated_user', { mode: 'bigint' }),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  name: varchar('name', { length: 255 }).notNull(),
  nameEn: varchar('name_en', { length: 255 }),
  zipCode: integer('zip_code'),
  district: bigint('district', { mode: 'bigint' })
    .notNull()
    .references(() => district.id),
})

// ---------------------------------------------------------------------------
// File management tables
// ---------------------------------------------------------------------------

export const fileMime = pgTable('file_mime', {
  id: id(),
  name: varchar('name', { length: 125 }),
})

export const filesDirectory = pgTable('files_directory', {
  id: id(),
  createdDate: timestamp('created_date', { precision: 6 }),
  createdUser: bigint('created_user', { mode: 'bigint' }),
  updatedDate: timestamp('updated_date', { precision: 6 }),
  updatedUser: bigint('updated_user', { mode: 'bigint' }),
  active: boolean('active').notNull(),
  name: varchar('name', { length: 125 }),
  filesDirectoryParent: bigint('files_directory_parent', { mode: 'bigint' }),
  fileSize: bigint('file_size', { mode: 'bigint' }).notNull().default(sql`0`),
  latestUpdated: timestamp('latest_updated', { precision: 6 }),
  owner: bigint('owner', { mode: 'bigint' }),
  fileCount: bigint('file_count', { mode: 'bigint' }).notNull().default(sql`0`),
  deleted: boolean('deleted').default(false),
})

export const filesDirectoryPath = pgTable(
  'files_directory_path',
  {
    filesDirectory: bigint('files_directory', { mode: 'bigint' }).notNull(),
    filesDirectoryParent: bigint('files_directory_parent', { mode: 'bigint' }).notNull(),
    level: integer('level').notNull(),
  },
  (t) => [primaryKey({ columns: [t.filesDirectory, t.filesDirectoryParent] })],
)

export const fileManager = pgTable('file_manager', {
  id: id(),
  deleted: boolean('deleted'),
  createdDate: timestamp('created_date', { precision: 6 }),
  createdUser: bigint('created_user', { mode: 'bigint' }),
  fileName: varchar('file_name', { length: 255 }),
  filePath: varchar('file_path', { length: 255 }),
  fileSize: bigint('file_size', { mode: 'bigint' }),
  hidden: boolean('hidden').notNull(),
  locked: boolean('locked').notNull(),
  originalFileName: varchar('original_file_name', { length: 125 }),
  readable: boolean('readable').notNull(),
  writeable: boolean('writeable').notNull(),
  fileMimeId: bigint('file_mime_id', { mode: 'bigint' }).references(() => fileMime.id),
  filesDirectoryId: bigint('files_directory_id', { mode: 'bigint' }).references(() => filesDirectory.id),
  owner: bigint('owner', { mode: 'bigint' }),
  description: text('description'),
  duration: integer('duration').default(0),
  title: varchar('title', { length: 125 }),
  thumbnailFile: bigint('thumbnail_file', { mode: 'bigint' })
    .references((): AnyPgColumn => fileManager.id),
  useThumbnail: boolean('use_thumbnail').default(false),
  updatedDate: timestamp('updated_date', { precision: 6 }),
  updatedUser: bigint('updated_user', { mode: 'bigint' }),
})

// ---------------------------------------------------------------------------
// Identity / RBAC tables
// ---------------------------------------------------------------------------

export const appUser = pgTable(
  'app_user',
  {
    id: id(),
    deleted: boolean('deleted'),
    createdDate: timestamp('created_date', { precision: 6 }),
    createdUser: bigint('created_user', { mode: 'bigint' }),
    updatedDate: timestamp('updated_date', { precision: 6 }),
    updatedUser: bigint('updated_user', { mode: 'bigint' }),
    active: boolean('active').notNull().default(true),
    // 0 = th, 1 = en (Adjusted to the actual system.)
    defaultLocale: smallint('default_locale'),
    email: varchar('email', { length: 125 }).notNull(),
    password: varchar('password', { length: 255 }),
    salt: varchar('salt', { length: 255 }),
    username: varchar('username', { length: 100 }),
    avatarFileId: bigint('avatar_file_id', { mode: 'bigint' }).references(() => fileManager.id),
    coverFileId: bigint('cover_file_id', { mode: 'bigint' }).references(() => fileManager.id),
  },
  (t) => [check('app_user_default_locale_check', sql`${t.defaultLocale} >= 0 AND ${t.defaultLocale} <= 1`)],
)

export const appRole = pgTable('app_role', {
  id: id(),
  deleted: boolean('deleted'),
  createdDate: timestamp('created_date', { precision: 6 }),
  createdUser: bigint('created_user', { mode: 'bigint' }),
  updatedDate: timestamp('updated_date', { precision: 6 }),
  updatedUser: bigint('updated_user', { mode: 'bigint' }),
  active: boolean('active'),
  name: varchar('name', { length: 125 }).notNull(),
})

export const permission = pgTable(
  'permission',
  {
    id: id(),
    // Convention: "<table_name>_<action>" eg app_user_add, app_user_edit,
    // app_user_delete, app_user_view, app_user_list
    code: varchar('code', { length: 125 }).notNull(),
    // 0 = READ, 1 = WRITE, 2 = MANAGE (Adjusted to the actual system.)
    operationType: smallint('operation_type'),
    module: varchar('module', { length: 255 }),
    description: text('description'),
  },
  (t) => [check('permission_operation_type_check', sql`${t.operationType} >= 0 AND ${t.operationType} <= 2`)],
)

export const appUserRole = pgTable(
  'app_user_role',
  {
    appUser: bigint('app_user', { mode: 'bigint' })
      .notNull()
      .references(() => appUser.id),
    appRole: bigint('app_role', { mode: 'bigint' })
      .notNull()
      .references(() => appRole.id),
  },
  (t) => [primaryKey({ columns: [t.appUser, t.appRole] })],
)

export const rolePermission = pgTable(
  'role_permission',
  {
    appRole: bigint('app_role', { mode: 'bigint' })
      .notNull()
      .references(() => appRole.id),
    permission: bigint('permission', { mode: 'bigint' })
      .notNull()
      .references(() => permission.id),
  },
  (t) => [primaryKey({ columns: [t.appRole, t.permission] })],
)

// ---------------------------------------------------------------------------
// Auth / session tables
// ---------------------------------------------------------------------------

export const apiClient = pgTable('api_client', {
  id: id(),
  createdDate: timestamp('created_date', { precision: 6 }),
  createdUser: bigint('created_user', { mode: 'bigint' }),
  updatedDate: timestamp('updated_date', { precision: 6 }),
  updatedUser: bigint('updated_user', { mode: 'bigint' }),
  apiName: varchar('api_name', { length: 100 }).notNull(),
  apiToken: varchar('api_token', { length: 255 }),
  byPass: boolean('by_pass'),
  status: boolean('status'),
})

export const apiClientIp = pgTable('api_client_ip', {
  id: id(),
  createdDate: timestamp('created_date', { precision: 6 }),
  createdUser: bigint('created_user', { mode: 'bigint' }),
  updatedDate: timestamp('updated_date', { precision: 6 }),
  updatedUser: bigint('updated_user', { mode: 'bigint' }),
  ipAddress: varchar('ip_address', { length: 50 }),
  status: boolean('status'),
  apiClient: bigint('api_client', { mode: 'bigint' })
    .notNull()
    .references(() => apiClient.id, { onDelete: 'cascade' }),
})

export const userAgent = pgTable('user_agent', {
  id: id(),
  agent: varchar('agent', { length: 255 }).notNull(),
})

export const loginLog = pgTable(
  'login_log',
  {
    id: id(),
    createdAt: timestamp('created_at', { precision: 6 }),
    deviceId: varchar('device_id', { length: 125 }),
    hostName: varchar('host_name', { length: 100 }),
    ip: varchar('ip', { length: 50 }),
    // 0 = web, 1 = mobile, 2 = api (Adjusted to the actual system.)
    loginFrom: smallint('login_from'),
    appUser: bigint('app_user', { mode: 'bigint' }).references(() => appUser.id),
    userAgent: bigint('user_agent', { mode: 'bigint' }).references(() => userAgent.id),
  },
  (t) => [check('login_log_login_from_check', sql`${t.loginFrom} >= 0 AND ${t.loginFrom} <= 2`)],
)

/**
* This table stores "Refresh Token" (not the JWT Access Token, which is stateless and not saved to the DB).
* Used for revoke/rotate/check expiration when calling /api/auth/refresh
*/
export const accessToken = pgTable(
  'access_token',
  {
    id: id(),
    createdDate: timestamp('created_date', { precision: 6 }),
    expiresAt: timestamp('expires_at', { precision: 6 }),
    fcmEnable: boolean('fcm_enable'),
    fcmToken: varchar('fcm_token', { length: 255 }),
    lastestActive: timestamp('lastest_active', { precision: 6 }),
    logoutedDate: timestamp('logouted_date', { precision: 6 }),
    revoked: boolean('revoked').notNull().default(false),
    // 0 = web, 1 = mobile
    service: smallint('service').notNull().default(0),
    token: varchar('token', { length: 100 }),
    apiClient: bigint('api_client', { mode: 'bigint' }).references(() => apiClient.id),
    appUser: bigint('app_user', { mode: 'bigint' }).references(() => appUser.id),
    loginLog: bigint('login_log', { mode: 'bigint' }).references(() => loginLog.id),
  },
  (t) => [
    check('access_token_service_check', sql`${t.service} >= 0 AND ${t.service} <= 1`),
    index('idx_access_token_fcm_token').on(t.fcmToken),
    index('idx_access_token_revoked').on(t.revoked),
    index('idx_access_token_lastest_active').on(t.lastestActive),
    index('idx_access_token_token').on(t.token),
  ],
)

// ---------------------------------------------------------------------------
// Misc / logging tables
// ---------------------------------------------------------------------------

export const favoriteMenu = pgTable('favorite_menu', {
  id: id(),
  url: varchar('url', { length: 255 }),
  appUser: bigint('app_user', { mode: 'bigint' }).references(() => appUser.id),
})

export const auditLog = pgTable('audit_log', {
  id: id(),
  action: varchar('action', { length: 255 }),
  details: text('details'),
  entityId: bigint('entity_id', { mode: 'bigint' }),
  entityName: varchar('entity_name', { length: 255 }),
  ipAddress: varchar('ip_address', { length: 255 }),
  timestamp: timestamp('timestamp', { precision: 6 }),
  username: varchar('username', { length: 255 }),
})

export const systemActivityLogs = pgTable('system_activity_logs', {
  id: id(),
  actionDateTime: timestamp('action_date_time', { precision: 6 }),
  description: varchar('description', { length: 255 }),
  userId: bigint('user_id', { mode: 'bigint' }).references(() => appUser.id),
})

export const aiDocumentMeta = pgTable(
  'ai_document_meta',
  {
    id: id(),
    deleted: boolean('deleted'),
    createdDate: timestamp('created_date', { precision: 6 }),
    createdUser: bigint('created_user', { mode: 'bigint' }),
    updatedDate: timestamp('updated_date', { precision: 6 }),
    updatedUser: bigint('updated_user', { mode: 'bigint' }),
    documentType: varchar('document_type', { length: 255 }),
    fileName: varchar('file_name', { length: 255 }),
    isActive: boolean('is_active').notNull(),
  },
  (t) => [
    check(
      'ai_document_meta_document_type_check',
      sql`${t.documentType} IN ('GENERAL', 'FAQ', 'USER_GUIDE', 'WI')`,
    ),
  ],
)

export const aiDocumentVectorIds = pgTable('ai_document_vector_ids', {
  documentId: bigint('document_id', { mode: 'bigint' })
    .primaryKey()
    .references(() => aiDocumentMeta.id),
  vectorId: varchar('vector_id', { length: 255 }),
})

// ---------------------------------------------------------------------------
// Relations (Used with Drizzle Query API, e.g., db.query.appUser.findFirst({ with: {...} }))
// ---------------------------------------------------------------------------

export const appUserRelations = relations(appUser, ({ many }) => ({
  userRoles: many(appUserRole),
  accessTokens: many(accessToken),
  loginLogs: many(loginLog),
}))

export const appRoleRelations = relations(appRole, ({ many }) => ({
  userRoles: many(appUserRole),
  rolePermissions: many(rolePermission),
}))

export const permissionRelations = relations(permission, ({ many }) => ({
  rolePermissions: many(rolePermission),
}))

export const appUserRoleRelations = relations(appUserRole, ({ one }) => ({
  user: one(appUser, { fields: [appUserRole.appUser], references: [appUser.id] }),
  role: one(appRole, { fields: [appUserRole.appRole], references: [appRole.id] }),
}))

export const rolePermissionRelations = relations(rolePermission, ({ one }) => ({
  role: one(appRole, { fields: [rolePermission.appRole], references: [appRole.id] }),
  permission: one(permission, { fields: [rolePermission.permission], references: [permission.id] }),
}))

export const accessTokenRelations = relations(accessToken, ({ one }) => ({
  user: one(appUser, { fields: [accessToken.appUser], references: [appUser.id] }),
  apiClientRef: one(apiClient, { fields: [accessToken.apiClient], references: [apiClient.id] }),
  loginLogRef: one(loginLog, { fields: [accessToken.loginLog], references: [loginLog.id] }),
}))

export const loginLogRelations = relations(loginLog, ({ one }) => ({
  user: one(appUser, { fields: [loginLog.appUser], references: [appUser.id] }),
  userAgentRef: one(userAgent, { fields: [loginLog.userAgent], references: [userAgent.id] }),
}))

/*
const record = await db.query.fileManager.findFirst({
  where: eq(schema.fileManager.id, BigInt(id)),
  with: {
    // Please retrieve only the 'name' column from the 'fileMime' table.
    fileMime: {
      columns: { name: true }
    },
    // Please retrieve only the filePath from your own table's thumbnail images.
    thumbnail: {
      columns: { filePath: true }
    }
  }
});

Result
{
  "id": 1,
  "fileName": "photo.jpg",
  "fileSize": 1024,
  // ...other columns of fileManager
  "fileMime": {
    "name": "image/jpeg"
  },
  "thumbnail": {
    "filePath": "/uploads/thumbnails/photo_thumb.jpg"
  }
}
*/
export const fileManagerRelations = relations(fileManager, ({ one }) => ({
  thumbnail: one(fileManager, {
    fields: [fileManager.thumbnailFile],
    references: [fileManager.id],
  }),
  fileMime: one(fileMime, {
    fields: [fileManager.fileMimeId],
    references: [fileMime.id],
  }),
}));
