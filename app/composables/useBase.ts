import type { AppNuxtError, IPageMeta, NavigateToOptions } from "~/types/common";
import type { RouteLocationRaw } from "vue-router";
import type { ButtonProps } from '@nuxt/ui';
import DOMPurify from 'dompurify';
export const useBase = () => {
  const route = useRoute();
  const router = useRouter();
  const { isServer } = useConfiguration();
  const { t } = useLang();
  const confirm = useConfirmDialog()
  const getCurrentPath = (fullPath = true) => {
    return fullPath ? route.fullPath : route.path;
  };
  const getPreviousPath = () => {
    return router.options.history.state.back;
  };
  const getPageMeta = () => {
    return route.meta;
  }
  const getPageMetaByKey = (key: IPageMeta) => {
    return route.meta[key];
  }
  const getParam = <T>(field: string): T | undefined => {
    if (!field) {
      return undefined;
    }
    return route.params ? (route.params[field] as T) : undefined;
  };
  const getParamNumber = (att: string): number => {
    const val = getParam(att);
    return val != undefined ? +val : 0;
  };
  const getQuery = <T>(field: string): T | undefined => {
    if (!field) {
      return;
    }
    return route.query ? (route.query[field] as T) : undefined;
  };
  const getQueryNumber = (att: string): number => {
    const val = getQuery(att);
    return val != undefined ? +val : 0;
  };
  const onReplaceUrl = (url: string) => {
    history.pushState({}, '', url);
  };
  const onPageGo = (link: string | undefined, replace?: boolean): void => {
    if (!link) {
      return;
    }
    if (!replace) {
      router.push(link);
    } else {
      router.replace(link);
    }
  };
  /*
  navigateTo('/about', {
      replace: true, // Replace current history entry
      external: false, // Handle external links
      force: false, // Force navigation even if route is same
  })
  https://nuxt.com/docs/api/utils/navigate-to
  */
  const appNavigateTo = async (to: RouteLocationRaw | undefined | null, options?: NavigateToOptions) => {
    await navigateTo(to, options as any);
    return new Promise((resolve) => resolve(true));
  }
  const onPageBack = () => {
    router.back();
  }

  const appThrowError = (param: AppNuxtError) => {
    return showError({
      statusCode: param.statusCode,
      statusMessage: param.statusMessage
    })
  }
  /**
   * <div ref="bottomSection"></div>
   * scrollToTop(bottomSection.value);
   * @param el
   */
  const scrollToTop = (el: Element) => {
    // window.scrollTo(0, 0);
    if (el) {
      // el.scrollIntoView({ behavior: 'smooth' });
      // el.scrollIntoView({ block: 'end', behavior: 'smooth' });
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };


  /**
  * const conf = await appConfirm(t('app.monogram'), t('base.deleteConfirm'));
  * @param title
  * @param description
  */
  const appConfirm = async (
    title: string,
    description: string,
    okBtn?: ButtonProps,
    cancelBtn?: ButtonProps
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      if (import.meta.server) {
        resolve(false)
      }
      confirm({
        title,
        description,
        confirmButton: okBtn,
        cancelButton: cancelBtn
      }).then((result) => {
        resolve(result)
      })
    });
  };
  const inputSanitizeHtml = (str: string | undefined | null,
    allowTags: string[] = ['b', 'i', 'em', 'strong', 'a'],
    allowAttrs: string[] = ['href', 'class', 'target', 'rel']) => {
    if (!str) {
      return '';
    }
    // if (isServer()) {
    //   return str;
    // }
    // return $domPurify.sanitize(str,
    return DOMPurify.sanitize(str,
      {
        ALLOWED_TAGS: allowTags,
        ALLOWED_ATTR: allowAttrs
      }
    );
  };
  return {
    getPageMeta,
    getPageMetaByKey,
    getCurrentPath,
    getPreviousPath,
    getParam,
    getParamNumber,
    getQuery,
    getQueryNumber,
    onReplaceUrl,
    onPageGo,
    onPageBack,
    appNavigateTo,
    appThrowError,
    scrollToTop,
    appConfirm,
    inputSanitizeHtml
  }
}
