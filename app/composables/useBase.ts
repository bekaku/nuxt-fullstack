import type { ButtonProps } from '@nuxt/ui';
// import DOMPurify from 'dompurify';
import DOMPurify from 'isomorphic-dompurify';
import type { RouteLocationRaw } from "vue-router";
import type { AppNuxtError, IPageMeta, NavigateToOptions } from "~/types/common";
export const useBase = () => {

  const { t } = useLang();
  const confirm = useConfirmDialog()
  const toast = useToast();
  const getCurrentPath = (fullPath = true) => {
    const route = useRoute();
    return fullPath ? route.fullPath : route.path;
  };
  const getPreviousPath = () => {
    const router = useRouter();
    return router.options.history.state.back;
  };
  const getPageMeta = () => {
    const route = useRoute();
    return route.meta;
  }
  const getPageMetaByKey = (key: IPageMeta) => {
    const route = useRoute();
    return route.meta[key];
  }
  const getParam = <T>(field: string): T | undefined => {
    if (!field) {
      return undefined;
    }
    const route = useRoute();
    return route.params ? (route.params[field] as T) : undefined;
  };
  const getParamNumber = (att: string): number => {
    const val = getParam(att);
    return val != undefined ? +val : 0;
  };
  const getPageQuery = <T>(field: string): T | undefined => {
    if (!field) {
      return;
    }
    const route = useRoute();
    return route.query ? (route.query[field] as T) : undefined;
  };
  const getQueryNumber = (att: string): number => {
    const val = getPageQuery(att);
    return val != undefined ? +val : 0;
  };
  const onReplaceUrl = (url: string) => {
    history.pushState({}, '', url);
  };
  const onPageGo = (link: string | undefined, replace?: boolean): void => {
    if (!link) {
      return;
    }
    const router = useRouter();
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
    const router = useRouter();
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

  const writeToClipboard = (text: string) => {
    if (import.meta.server) {
      return;
    }
    navigator.clipboard.writeText(text);
    toast.add({
      description: t('success.copy')
    })
  }
  return {
    getPageMeta,
    getPageMetaByKey,
    getCurrentPath,
    getPreviousPath,
    getParam,
    getParamNumber,
    getPageQuery,
    getQueryNumber,
    onReplaceUrl,
    onPageGo,
    onPageBack,
    appNavigateTo,
    appThrowError,
    scrollToTop,
    appConfirm,
    inputSanitizeHtml,
    writeToClipboard
  }
}
