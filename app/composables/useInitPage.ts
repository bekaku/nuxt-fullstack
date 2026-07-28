import type { IPageMetaConfig } from "~/types/common";

export const useInitPage = (config?: IPageMetaConfig) => {
    const { getPageMetaByKey } = useBase();
    const { t } = useLang();
    if (config?.setTitle !== false) {
        const pageName = getPageMetaByKey('pageName') as string;
        useHead({
            title: pageName != undefined ? t(pageName) : undefined
        })
    }
}
