import type { ApiResponse, CrudListApiOptions, ISortModeType, ResponseEntity } from "~/types/common";

export const usePagefecth = <T>(options: CrudListApiOptions) => {

  const api = useApi();
  const { pages, resetPaging } = usePaging(options?.itemsPerPage ? options.itemsPerPage : 10)
  const { sorts, resetSort } = useSort(options.defaultSorts)
  const dataList = ref<T[]>([]) as Ref<T[]>
  const isInfiniteDisabled = ref(false)
  const firstLoaded = ref(false)
  const loading = ref(false)
  const urlEndpoint = ref(options.apiEndpoint)
  const additionalUri = ref(options?.additionalUri)

  const queryParam = computed((): string | undefined => {
    let haveParam = false
    let q = ''
    if (options.pageAble == undefined || options.pageAble) {
      if (pages.value) {
        q += `page=${options.pageStartZero == undefined || options.pageStartZero ? (pages.value.current > 0 ? pages.value.current - 1 : 0) : pages.value.current}`
        q += `&size=${pages.value.itemsPerPage}`
        haveParam = true
      }
    }
    if (options.sortable == undefined || options.sortable) {
      if (sorts.value && sorts.value.length > 0) {
        for (const sortAtl of sorts.value) {
          q += `${sortAtl.column && sortAtl.mode ? '&sort=' + sortAtl.column + ',' + sortAtl.mode : ''}`
        }
      }
      haveParam = true
    }
    if (additionalUri.value) {
      if (haveParam) {
        q += '&'
      }
      q += `${additionalUri.value}`
    }
    return !isEmpty(q) ? q : undefined
  })
  const apiEndpoint = computed(
    () => `${urlEndpoint.value}${queryParam.value ? '?' + queryParam.value : ''}`
  )

  const loadDataProcess = async (): Promise<ResponseEntity<ApiResponse<T>> | null> => {
    try {
      const response = await api<ResponseEntity<ApiResponse<T>>>(apiEndpoint.value, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("An error occurred while fetching data.:", error);
      return null
    }
  }
  const setDataList = (list: T[]): Promise<void> => {
    return new Promise(resolve => {
      if (pages.value && pages.value.current == 1) {
        dataList.value = list
      } else {
        if (!options.concatList) {
          dataList.value = list
        } else {
          if (!options.addUnshift) {
            dataList.value.push(...list)
          } else {
            dataList.value.unshift(...list)
          }
        }
      }
      resolve()
    })
  }
  const loadData = async (): Promise<void> => {
    loading.value = true
    const response = await loadDataProcess()
    let list: T[] = []
    if (response?.status == 200 && response?.data) {
      const data = response?.data
      if (isListResponse(data)) {
        if (!options.reverseList) {
          list = data.dataList
        } else {
          list = data.dataList.reverse()
        }
        await setDataList(list)
        if (data.totalPages != undefined && pages.value) {
          pages.value.totalPages = data.totalPages
        }
        if (data.totalElements != undefined && pages.value) {
          pages.value.totalElements = data.totalElements
          if (data.totalElements == 0 || data.totalElements < pages.value.itemsPerPage) {
            isInfiniteDisabled.value = true
          }
        }
        if (data.last != undefined && pages.value) {
          pages.value.last = data.last
          isInfiniteDisabled.value = data.last
        }
      } else if (data && isArray(data)) {
        const responseList: T[] = data as unknown as T[]
        if (pages.value) {
          if (responseList.length == 0 || responseList.length < pages.value.itemsPerPage) {
            isInfiniteDisabled.value = true
          }
        }
        if (!options.reverseList) {
          list = responseList
        } else {
          list = responseList.reverse()
        }
        await setDataList(list)
      }
    }

    if (!firstLoaded.value) {
      firstLoaded.value = true
    }

    loading.value = false
    return;
  }
  const resetData = (resetPage: boolean = true) => {
    if (resetPage) {
      resetPaging()
    }
    dataList.value = []
    firstLoaded.value = false
    isInfiniteDisabled.value = false
  }
  const onReload = async (): Promise<void> => {
    resetPaging()
    resetSort()
    if (!options.preventResetListReload) {
      firstLoaded.value = false
      dataList.value = []
    }
    isInfiniteDisabled.value = false
    await loadData()
    return new Promise(resolve => resolve())
  }
  const onNextPage = async (): Promise<void> => {
    if (firstLoaded.value) {
      if (pages.value) {
        pages.value.current++
      }
      await loadData()
    }
    return;
  }
  const loadPageChange = async (resetPage: boolean = false): Promise<void> => {
    resetData(resetPage)
    await loadData()
    return;
  }
  const onPageChange = async (value: number | undefined): Promise<void> => {
    await loadPageChange(false)
    return
  }

  const onPerPageChange = async (value: number | undefined): Promise<void> => {
    await loadPageChange(false)
    return
  }
  const onSortColumn = async (column: string): Promise<void> => {
    if (!sorts.value) {
      sorts.value = []
    }

    const currentSort = sorts.value[0]

    if (currentSort && currentSort.column === column) {
      sorts.value = [{
        column: column,
        mode: currentSort.mode === 'asc' ? 'desc' : 'asc'
      }]
    } else {
      sorts.value = [{
        column: column,
        mode: 'asc'
      }]
    }

    await loadData()
  }
  const onSortMode = async (mode: ISortModeType): Promise<void> => {
    if (!sorts.value || sorts.value.length === 0) {
      return;
    }
    const currentColumn = sorts.value[0]?.column;
    if (!currentColumn) return;
    sorts.value = [{
      column: currentColumn,
      mode: mode
    }];

    await loadData();
  }
  const getItemById = (id: string | number): T | undefined => {
    return dataList.value.find((item: any) => item?.id === id)
  }
  const getItemIndexById = (id: string | number): number => {
    return dataList.value.findIndex((item: any) => item?.id === id)
  }

  const getItemByIndex = (index: number) => {
    return dataList.value[index]
  }

  const removeItemById = (id: string | number) => {
    const index = getItemIndexById(id)
    if (index !== -1) {
      dataList.value.splice(index, 1)
    }
  }
  const removeItemByIndex = (index: number) => {
    dataList.value.splice(index, 1)
  }
  return {
    isInfiniteDisabled,
    firstLoaded,
    loading,
    pages,
    sorts,
    dataList,
    urlEndpoint,
    additionalUri,
    loadData,
    resetData,
    onPageChange,
    onPerPageChange,
    onNextPage,
    onReload,
    onSortColumn,
    onSortMode,
    getItemById,
    getItemByIndex,
    removeItemById,
    removeItemByIndex
  }
}
