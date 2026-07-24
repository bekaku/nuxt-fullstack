import type { IPagination } from "~/types/common";

export const usePaging = (perPage?: number) => {
  const { getPageQuery } = useBase();
  const { defaultMaxItemsPerPage, defultItemsPerPage } = useConfiguration()
  const getNumberQuery = (param: string): number => {
    const pageQuery = getPageQuery(param);
    return pageQuery ? +pageQuery : 0;
  };
  const p = getNumberQuery('page');
  const s = getNumberQuery('size');
  const pagesInitial: IPagination = {
    current: p != undefined ? p + 1 : 1,
    itemsPerPage: s && s <= defaultMaxItemsPerPage && s > 0 ? s : perPage ? perPage : defultItemsPerPage,
    totalPages: 0,
    totalElements: 0,
    last: false,
  };
  const pages = ref<IPagination | undefined>(cloneObject<IPagination>(pagesInitial));
  const resetPaging = () => {
    pages.value = cloneObject<IPagination>(pagesInitial);
  };
  return {
    pages,
    resetPaging,
    pagesInitial
  };
};
