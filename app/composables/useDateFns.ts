
import { th, enUS } from 'date-fns/locale';
import { FORMAT_DATE_DD_MM_YY, FORMAT_DATE_TIME_ALT } from '~/utils/dateUtil';
export const useDateFns = () => {
  const { $datefns } = useNuxtApp()
  const { locale } = useLang();

  const parseISO = (
    date: string,
  ): Date => {
    return $datefns.parseISO(date);
  };

  const convertStringToDate = (
    date: string,
    iso: boolean = false,
    format = FORMAT_DATE_TIME_ALT,
  ): Date => {
    if (iso) {
      return $datefns.parseISO(date);
    }
    return $datefns.parse(date, format, new Date());
    // return new Date(dateString);
  };
  /**
   *
   * @param dateLeft the later date
   * @param dateRight the earlier date
   * @returns
   */
  const getDateDiffMinutes = (
    dateLeft: Date | number,
    dateRight: Date | number
  ) => {
    return $datefns.differenceInMinutes(dateRight, dateLeft);
  };

  const getDateDiff = (dateLeft: Date | number, dateRight: Date | number) => {
    return $datefns.differenceInDays(dateRight, dateLeft);
  };
  const getDateDiffNow = (date: string) => {
    const d = removeTime(date);
    const currentDate = removeTime(getCurrentDateByFormat());
    if (d == undefined || currentDate == undefined) {
      return 0;
    }
    // return getDateDiff(Date.parse(d), new Date());
    return getDateDiff(Date.parse(d), Date.parse(currentDate));
  };
  const getDateAutoFormatBy = (options: {
    date: string,
    iso?: boolean,
  }) => {
    if (!options.date) {
      return '';
    }

    const difDays = getDateDiffNow(options.date);
    if (difDays >= 365) {
      return formatDateTime({
        date: options.date,
        iso: options.iso,
        format: FORMAT_DATE_DD_MM_YY
      });
    } else if (difDays >= 1 || difDays <= -1) {
      return formatDateTime({
        date: options.date,
        iso: options.iso,
        format: FORMAT_DATE_DD_MM
      });
    }
    return formatDateTime({
      date: options.date,
      iso: options.iso,
      format: FORMAT_DATE_HH_MM
    });
  };
  const getDateTimeAutoFormatBy = (options: {
    date: string,
    iso?: boolean,
  }) => {
    if (!options.date) {
      return '';
    }
    const difDays = getDateDiffNow(options.date);
    if (difDays >= 0 && difDays < 1) {
      return formatDateTime({
        date: options.date,
        iso: options.iso,
        format: FORMAT_DATE_HH_MM
      });
    } else if (difDays >= 1 && difDays < 365) {
      return formatDateTime({
        date: options.date,
        iso: options.iso,
        format: FORMAT_DATE_DD_MM_HH_MM
      });
    } else {
      return formatDateTime({
        date: options.date,
        iso: options.iso,
        format: FORMAT_DATE_TIME_ALT
      });
    }
  };
  const getDateDistanceAutoFormatBy = (options: {
    date: string,
    iso?: boolean,
  }) => {
    if (!options.date) {
      return '';
    }
    const difDays = getDateDiffNow(options.date);
    if (difDays >= 0 && difDays < 1) {
      return formatDistanceFromNow({
        date: options.date,
        suffix: false,
        iso: false
      });
    } else if (difDays >= 1 && difDays < 365) {
      return formatDateTime({
        date: options.date,
        iso: options.iso,
        format: FORMAT_DATE_DD_MM_HH_MM
      });
    } else {

      return formatDateTime({
        date: options.date,
        iso: options.iso,
        format: FORMAT_DATE_TIME_ALT
      });
    }
  };
  /**
   * formatRelativeFromNow('2022-05-25 17:26:31', locale.value)
   * @param dateString
   * @returns
   */
  const formatRelativeFromNow = (
    options: {
    date: string,
    iso?: boolean,
    format?: string,
  }
  ) => {
    if (!options.date) {
      return;
    }
   const d= convertStringToDate(options.date, options.iso || false, options.format || FORMAT_DATE_TIME_ALT)
    return $datefns.formatRelative(d, {
      locale: locale.value == 'th' ? th : enUS
    });
  };
  /**
   * formatDistanceFromNow('2022-05-25 17:26:31', locale.value)
   * @param dateString
   * @param suffix
   * @returns
   */
  const formatDistanceFromNow = (options: {
    date: string,
    suffix?: boolean,
    iso?: boolean,
    format?: string,
  }) => {
    return $datefns.formatDistanceToNow(
      convertStringToDate(options.date, options.iso || false, options.format || FORMAT_DATE_TIME_ALT),
      {
        locale: locale.value == 'th' ? th : enUS,
        addSuffix: options.suffix || false
      });
  };
  const getCurrentDateByFormat = (
    forMatString: string | undefined = FORMAT_DATE_YYYY_MM_DD//yyyy-MM-dd
  ) => {
    return formatDateBy(getDateNow(), forMatString);
  };

  /**
   * formatDate('2022-05-25 17:26:31', 'dd MMMM yyyy', locale.value)
   * @param dateString
   * @param forMatString
   * @returns
   */
  const formatDateTime = (
    options: {
      date: string,
      iso?: boolean,
      format?: string,
    }
  ) => {
    if (!options.date) {
      return '';
    }
    return $datefns.format(convertStringToDate(options.date, options.iso || false, options.format || FORMAT_DATE_TIME_ALT), options.format || FORMAT_DATE_TIME_ALT, {
      locale: locale.value == 'th' ? th : enUS
    });
  };
  const formatDate = (options: {
    date: string,
    suffix?: boolean,
    iso?: boolean,
    format?: string,
  }
  ) => {
    if (!options.date) {
      return undefined;
    }
    const d = removeTime(options.date);
    return d
      ? $datefns.format(convertStringToDate(options.date, options.iso || false, options.format || FORMAT_DATE_YYYY_MM_DD), options.format || FORMAT_DATE_YYYY_MM_DD, {
        locale: locale.value == 'th' ? th : enUS
      })
      : undefined;
  };
  const formatDateBy = (d: Date, forMatString: string) => {
    return $datefns.format(d, forMatString);
  };
  const formatDistanceFrom = (
    options: {
      date: string,
      iso?: boolean,
      format?: string,
    }

  ) => {
    return $datefns.formatDistance(
      convertStringToDate(options.date, options.iso || false, options.format || FORMAT_DATE_TIME_ALT),
      new Date(),
      {
        locale: locale.value == 'th' ? th : enUS,
        addSuffix: true
      }
    );
  };
  const formatIso = (options: { date: string, forMatString: string }) => {
    return $datefns.format($datefns.parseISO(options.date), options.forMatString);
  };

  const isDateEqua = (options: {
    dateLeft: string,
    dateRight: string,
    iso?: boolean,
    format?: string,
  }) => {
    const d1 = convertStringToDate(options.dateLeft, options.iso || false, options.format || FORMAT_DATE_YYYY_MM_DD);
    const d2 = convertStringToDate(options.dateRight, options.iso || false, options.format || FORMAT_DATE_YYYY_MM_DD);
    return $datefns.isEqual(d1, d2);
  };
  const isDateAfter = (options: {
    dateLeft: string,
    dateRight: string,
    iso?: boolean,
    format?: string,
  }) => {
    const d1 = convertStringToDate(options.dateLeft, options.iso || false, options.format || FORMAT_DATE_YYYY_MM_DD);
    const d2 = convertStringToDate(options.dateRight, options.iso || false, options.format || FORMAT_DATE_YYYY_MM_DD);
    return $datefns.isAfter(d1, d2);
  };
  const isDateBefore = (options: {
    dateLeft: string,
    dateRight: string,
    iso?: boolean,
    format?: string,
  }) => {
    const d1 = convertStringToDate(options.dateLeft, options.iso || false, options.format || FORMAT_DATE_YYYY_MM_DD);
    const d2 = convertStringToDate(options.dateRight, options.iso || false, options.format || FORMAT_DATE_YYYY_MM_DD);
    return $datefns.isBefore(d1, d2);
  };
  return {
    getCurrentDateByFormat,
    getDateDiffMinutes,
    formatDistanceFromNow,
    formatDate,
    formatDateTime,
    getDateTimeAutoFormatBy,
    parseISO
  };
};
