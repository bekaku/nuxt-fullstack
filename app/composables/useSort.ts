import type { ISort, ISortMode } from '~/types/common';

export const useSort = (defaultSorts?: ISort[]) => {
  const { getQuery } = useBase();
  const { t } = useLang();

  const sortMode = ref<ISortMode[]>([
    { value: 'asc', label: t('sort.asc') },
    { value: 'desc', label: t('sort.desc') },
  ]);

  const getSortParams = (): ISort[] | undefined => {
    let sortQuery = getQuery('sort') as any;

    if (!sortQuery) {
      return undefined;
    }

    // If it's not an array, convert it to an array by inserting the values ​​into it.
    if (!isArray(sortQuery)) {
      sortQuery = [sortQuery];
    }

    const sItems: ISort[] = [];

    sortQuery.forEach((item: string) => {
      const sortArr = item.split(',');
      if (sortArr.length == 2) {
        const field = sortArr[0];
        const mode = sortArr[1];
        if (mode == 'asc' || mode == 'desc') {
          sItems.push({
            column: field,
            mode: mode as 'asc' | 'desc',
          });
        }
      }
    });

    return sItems.length > 0 ? sItems : undefined;
  };

  const sortQuerys = getSortParams();

  const sortInitials: ISort[] | undefined = sortQuerys || defaultSorts;

  const sorts = ref<ISort[] | undefined>(cloneObject<ISort[]>(sortInitials));

  const resetSort = () => {
    sorts.value = cloneObject<ISort[]>(defaultSorts);
  };

  return {
    sortMode,
    sorts,
    resetSort,
  };
};
