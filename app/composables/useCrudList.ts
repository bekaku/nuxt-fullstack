import { CrudAction, SearchOperation, SearchParamiter } from "~/libs/constants";
import type { ApiResponse, CrudListApiOptions, ICrudAction, ICrudListHeader, ISortModeType, ResponseEntity } from "~/types/common";

export const useCrudList = <T>(options: CrudListApiOptions) => {
  const { inputSanitizeHtml, getPageQuery, getCurrentPath, appNavigateTo, onReplaceUrl } = useBase();
  const confirm = useConfirmDialog();
  const loader = useLoader();
  const { t } = useLang();
  const api = useApi();
  const {
    isInfiniteDisabled,
    firstLoaded,
    loading,
    pages,
    sorts,
    dataList,
    apiEndpoint,
    endpointDelete,
    additionalUri,
    manualActionList,
    advanceSearchUri,
    keywordSearchText,
    queryParam,
    loadData,
    resetData,
    onPageChange: onPageChangeBase,
    onPerPageChange: onPerPageChangeBase,
    onNextPage,
    onReload,
    onSort: onSortBase,
    onSortColumn: onSortColumnBase,
    onSortMode: onSortModeBase,
    getItemById,
    getItemByIndex,
    removeItemById,
    removeItemByIndex
  } = usePagefecth<T>(options);

  const sortTimeout = ref<any>()
  const headers = shallowRef<ICrudListHeader[]>(options.headers || []);
  const crudName = ref(options?.crudName)//PascalCase only eg: User, AppRole

  const deleteApiEndpoint = computed(() =>
    endpointDelete.value
      ? endpointDelete.value
      : crudName.value
        ? `/api/${pascalToKebab(crudName.value)}`//springboot: pascalToCamelCase(crudName.value), pascalToKebab(crudName.value)
        : ''
  );

  const searchableHeaders = computed<ICrudListHeader[]>(() => {
    if (!headers.value || headers.value.length === 0) {
      return [];
    }
    return headers.value.filter((c) => c.options?.searchable === true);
  });
  const pathParam = computed(() => {
    if (!options) {
      return;
    }
    return `${getCurrentPath(false)}${queryParam.value ? '?' + queryParam.value : ''}`;
  });
  const validateColunmExist = (colnmName: string): boolean => searchableHeaders.value.find((c) => c.column === colnmName) != undefined;
  const setQSearch = (q: any, operation: string) => {
    const qSplit = q.split(operation);
    if (qSplit.length == 2) {
      if (validateColunmExist(qSplit[0])) {
        if (!advanceSearchUri.value) {
          advanceSearchUri.value = `${SearchParamiter}=${inputSanitizeHtml(q.trim())}`;
        } else {
          advanceSearchUri.value += ',' + inputSanitizeHtml(q.trim());
        }
      }
    }
  };
  const validateQSearch = () => {
    const qParam = getPageQuery<string>(SearchParamiter);
    const qParmArray = qParam?.split(',');
    const operations: any = SearchOperation;
    if (qParmArray && qParmArray.length > 0) {
      for (const q of qParmArray) {
        for (const k in operations) {
          setQSearch(q, operations[k]);
        }
      }
    }
  };

  const onPageChange = async (pageNo: number | undefined) => {
    if (pageNo == undefined || !pages.value) {
      return;
    }
    await onPageChangeBase(pageNo);
    onPasteUrlPathParam();
  };

  const onPerPageChange = async (no: number | undefined) => {
    if (no == undefined || !pages.value) {
      return;
    }
    await onPerPageChangeBase(no);
    onPasteUrlPathParam();
  };


  const onSort = async (column: string, mode: ISortModeType): Promise<void> => {
    if (column == undefined || mode == undefined) {
      return;
    }
    await onSortBase(column, mode);
    sortTimeout.value = setTimeout(() => {
      onPasteUrlPathParam();
    }, 150);
  }
  const onSortColumn = async (column: string | undefined): Promise<void> => {
    if (column == undefined) {
      return;
    }

    await onSortColumnBase(column);
    sortTimeout.value = setTimeout(() => {
      onPasteUrlPathParam();
    }, 150);

  };

  const onSortMode = async (mode: ISortModeType): Promise<void> => {
    await onSortModeBase(mode);
    sortTimeout.value = setTimeout(() => {
      onPasteUrlPathParam();
    }, 150);
  }

  const onPasteUrlPathParam = async () => {
    if (!pathParam.value) {
      return;
    }
    // appNavigateTo(pathParam.value);
    onReplaceUrl(pathParam.value);
    // await loadData();
  };

  const onSearch = async (q: string) => {
    keywordSearchText.value = '';
    advanceSearchUri.value = `${SearchParamiter}=${q}`;
    onPasteUrlPathParam();
    await loadData();
  };
  const onKeywordSearch = async (keyword: string) => {
    keywordSearchText.value = inputSanitizeHtml(keyword);
    onPasteUrlPathParam();
    await loadData();
  };
  const onItemDelete = async (
    index: number | number[],
  ) => {

    if (!deleteApiEndpoint.value || index == undefined) {
      console.warn("No delete endpoint defined");
      return;
    }
    const indexArray = [];
    if (!Array.isArray(index)) {
      indexArray.push(index);
    } else {
      indexArray.push(...index)
    }
    indexArray.sort((a, b) => b - a);
    loader.open();
    for (const i of indexArray) {
      const item: any = getItemByIndex(i);
      if (item && item.id) {
        const status = await deleteProcess(item.id);
        if (status === 200) {
          dataList.value.splice(i, 1)
        }
      }
    }
    loader.close();
  }

  const deleteProcess = async (id: string,): Promise<number> => {
    if (!deleteApiEndpoint.value) {
      return 400;
    }
    try {
      const response = await api<ResponseEntity<ApiResponse<void>>>(`${deleteApiEndpoint.value}/${id}`, {
        method: "DELETE",
      });
      return response.status;
    } catch (error) {
      console.error("An error occurred while delete data.:", error);
      return 400
    }
  }

  const onNewForm = () => {
    if (options?.pathNew) {
      appNavigateTo(options.pathNew);
    } else if (crudName.value) {
      appNavigateTo(`/${pascalToKebab(crudName.value)}/${CrudAction.NEW}/0`);
    }
  };
  const onItemClick = async (index: number, type: ICrudAction) => {
    const item: any = await getItemByIndex(index);
    if (!item) {
      return;
    }
    if (options?.pathView) {
      appNavigateTo(`${options.pathView}/${item.id}`);
    } else if (crudName.value) {
      appNavigateTo(`/${pascalToKebab(crudName.value)}/${type == 'view' ? CrudAction.VIEW : CrudAction.EDIT}/${item.id}`);
    }
  };
  const onItemCopy = async (index: number) => {
    const item: any = await getItemByIndex(index);
    if (!item) {
      return;
    }
    if (options?.pathCopy) {
      appNavigateTo(`${options.pathCopy}/${item.id}`);
    } else if (crudName.value) {
      appNavigateTo(
        `/${pascalToKebab(crudName.value)}/${CrudAction.COPY}/${item.id}`
      );
    }
  };


  // Init and auto load
  validateQSearch();
  if (options?.fetchListOnload == undefined || options.fetchListOnload === true) {
    loadData();
  }
  onBeforeUnmount(() => {
    dataList.value = [];
    advanceSearchUri.value = '';
    keywordSearchText.value = '';
    manualActionList.value = undefined;
    additionalUri.value = undefined;
    apiEndpoint.value = undefined;
    endpointDelete.value = undefined;
    crudName.value = undefined;
    if (sortTimeout.value) {
      clearTimeout(sortTimeout.value);
      sortTimeout.value = null
    }
  });
  return {
    isInfiniteDisabled,
    firstLoaded,
    loading,
    pages,
    sorts,
    dataList,
    apiEndpoint,
    endpointDelete,
    additionalUri,
    manualActionList,
    advanceSearchUri,
    keywordSearchText,
    queryParam,
    crudName,
    headers,
    loadData,
    resetData,
    onPageChange,
    onPerPageChange,
    onNextPage,
    onReload,
    onSort,
    onSortColumn,
    onSortMode,
    getItemById,
    getItemByIndex,
    removeItemById,
    removeItemByIndex,
    onSearch,
    onKeywordSearch,
    onNewForm,
    onItemDelete,
    onItemClick,
    onItemCopy
  }
}
