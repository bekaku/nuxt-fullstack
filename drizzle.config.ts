/// <reference types="node" />
import { defineConfig } from 'drizzle-kit'
import 'dotenv/config'
export default defineConfig({
  schema: './server/database/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.NUXT_DATABASE_URL || 'postgres://app_user:app_password@localhost:5432/nuxt4_rbac',
  },
  strict: true,
  verbose: true,
})
