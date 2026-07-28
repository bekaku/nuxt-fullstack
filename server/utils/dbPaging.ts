import { getQuery, type H3Event } from 'h3'
import { asc, desc, ilike, eq, ne, gt, gte, lt, lte, and, type AnyColumn, type SQL, or } from 'drizzle-orm'
import { SearchOperation } from '~/types/common';


interface PaginateConfig<T> {
  // 1. Receive the Query Builders that have been prepared with a Join.
  dataQuery: any;
  countQuery: any;
  // 2. A map that points to which column in which table each string refers to.
  columns: Record<string, AnyColumn>;
  defaultSort: AnyColumn;
  searchColumns?: AnyColumn[];
  where?: SQL;
  transform?: (item: any) => T | Promise<T>;
}

export async function paginate<T>(
  event: H3Event,
  config: PaginateConfig<T>
) {
  const query = getQuery(event)

  const currentPage = parseInt(query.page as string) || 0
  const size = parseInt(query.size as string) || 10
  const limit = size
  const offset = currentPage * size

  // --- Sorting ---
  const orderByClause = []
  const sortQuery = query.sort

  if (sortQuery) {
    const sorts = Array.isArray(sortQuery) ? sortQuery : [sortQuery]
    for (const s of sorts) {
      const [field, direction] = s.split(',')
      if (!field) continue

      // Extract columns from the map we've prepared (supports fields across tables).
      const column = config.columns[field]

      if (column) {
        orderByClause.push(direction === 'desc' ? desc(column) : asc(column))
      }
    }
  }

  if (orderByClause.length === 0) {
    orderByClause.push(desc(config.defaultSort))
  }

  // --- Filter & Search ---
  const conditions: SQL[] = []

  if (config.where) {
    conditions.push(config.where)
  }

  const searchStr = query._q as string
  if (searchStr) {
    const filters = searchStr.split(',')
    for (const filter of filters) {
      const match = filter.match(/^([a-zA-Z0-9_]+)(>=|<=|!=|>|<|=|:)(.+)$/)

      if (match) {
        const [, field, operator, value] = match
        if (!field || !value) continue

        // Pull columns from the map in the same way.
        const column = config.columns[field]

        if (column) {
          let parsedValue: any = value

          if (value.toLowerCase() === 'true') parsedValue = true
          else if (value.toLowerCase() === 'false') parsedValue = false
          else if (value.toLowerCase() === 'null') parsedValue = null
          else if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/.test(value)) {
            const dateVal = new Date(value)
            if (!isNaN(dateVal.getTime())) parsedValue = dateVal
          }

          switch (operator as SearchOperation) {
            case ':': conditions.push(ilike(column, `%${parsedValue}%`)); break;
            case '=': conditions.push(eq(column, parsedValue)); break;
            case '!=': conditions.push(ne(column, parsedValue)); break;
            case '>': conditions.push(gt(column, parsedValue)); break;
            case '>=': conditions.push(gte(column, parsedValue)); break;
            case '<': conditions.push(lt(column, parsedValue)); break;
            case '<=': conditions.push(lte(column, parsedValue)); break;
          }
        }
      }
    }
  }

  // --- Manage Global Search (Search for a single word across multiple columns)
  const keywordStr = query._keyword as string //Suppose the client sends ?_keyword=...

  console.log('keywordStr', keywordStr)
  if (keywordStr && config.searchColumns && config.searchColumns.length > 0) {
    // Create an ILIKE condition for all columns specified in searchColumns.
    const searchOrConditions = config.searchColumns.map((col) =>
      ilike(col, `%${keywordStr}%`)
    )

    const globalSearchCondition = or(...searchOrConditions)
    // Perform an OR operation on all of them, then pass it to the main conditions.
    if (globalSearchCondition) {
      conditions.push(globalSearchCondition)
    }
  }


  console.log('conditions', conditions)

  const finalWhere = conditions.length > 0 ? and(...conditions) : undefined

  // --- Execute Query ---
  // Combine the submitted query with .where(), .orderBy(), limit, and offset.
  const [totalResult, items] = await Promise.all([
    config.countQuery
      .where(finalWhere),

    config.dataQuery
      .where(finalWhere)
      .orderBy(...orderByClause)
      .limit(limit)
      .offset(offset),
  ])

  const totalElements = totalResult[0]?.value ?? 0
  const totalPages = Math.ceil(totalElements / size)
  const last = currentPage >= totalPages - 1 || totalElements === 0

  const dataList = config.transform ? await Promise.all(items.map(config.transform)) : items

  return {
    totalPages,
    currentPage,
    totalElements,
    last,
    dataList,
  }
}
