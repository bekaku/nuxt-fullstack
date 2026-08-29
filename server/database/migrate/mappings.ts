import { bitToBool, toDateString } from './helpers'

export interface MigrationConfig {
  sourceTable: string
  targetTable: string
  targetColumns: string[]
  cursorColumn?: string // In case any table doesn't use id as a Primary Key
  mapRow: (row: any) => any[] // Function to convert a row from MySQL into an array of the desired values.
}

export const tableMappings: MigrationConfig[] = [
  {
    sourceTable: 'app_user',
    targetTable: 'app_user_test',
    // 1. Specify the destination column names in PG (only include the ones you want).
    targetColumns: ['id', 'login_name', 'active', 'last_login', 'use_mobile_app'],

    // 2. Map each value to match the column order above.
    mapRow: (row) => [
      row.id,
      row.login_name,
      bitToBool(row.active),
      toDateString(row.last_login),
      bitToBool(row.use_mobile_app)
    ]
  },
  // {
  //   sourceTable: 'department',
  //   targetTable: 'department_pg',
  //   targetColumns: ['dept_id', 'dept_name', 'is_active'],
  //   cursorColumn: 'dept_id',// Tell the system that this table needs to loop through dept_id in the WHERE clause.
  //   mapRow: (row) => [
  //     row.dept_id,
  //     row.name, // The source name can be 'name' and the destination name can be 'dept_name'.
  //     bitToBool(row.status_active)
  //   ]
  // }
]
