import { useRbac } from "~/composables/useRbac";

export default defineNuxtRouteMiddleware(async (to) => {
    // console.log('middleware > initAuth.global > Pagename: ', to.name, ', path: ',to.path);
    // skip middleware on client side entirely
    // if (import.meta.client) return

    // skip middleware on server
    // if (import.meta.server) return
    // console.log('middleware > checkPermit.global > ', to);
    const metaRequirePermit=to?.meta?.requiresPermission;
    if(metaRequirePermit!=undefined && isArray(metaRequirePermit)){

        const { auth } = useAuth();

        // Unauthenticated visitors must be sent to login, not shown a hard 403.
        if (!auth.value && to.path !== '/auth/login') {
            const continueQuery = encodeURIComponent(to.fullPath);
            return navigateTo(`/auth/login?continue=${continueQuery}`);
        }

       const { isHavePermissionLazy } = useRbac();
       const isPermited= await isHavePermissionLazy(metaRequirePermit as string[]);
        // console.log('middleware > checkPermit.global > metaRequirePermit: ', metaRequirePermit);
        // console.log('isPermited', isPermited);
        //TODO implement check authorize to this page or not
        if(!isPermited){
            // abortNavigation() throws immediately, so showError() below it was unreachable.
            // Throwing createError directly renders the 403 error page.
            throw createError({
                statusCode: 403,
                statusMessage: 'Forbidden'
            })
        }
    }
})
