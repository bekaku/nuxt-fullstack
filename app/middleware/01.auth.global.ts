import { AuthNoFilterPage } from '~/libs/constants';
export default defineNuxtRouteMiddleware(async (to) => {
  if (to.name == undefined || (typeof to.name !== 'string')) return
  const baseRouteName = to?.name?.replace(/___[a-z]{2}$/, '');
  if (typeof to.name == 'string' && AuthNoFilterPage.includes(baseRouteName)) return
  // console.log('middleware > auth.global > Pagename: ', to.name, ', path: ', to.path, ',meta: ', to.meta?.layout);

  const { auth, fetchMe } = useAuth();
  const { initialAppNav } = useMenu();
  const loggedInCookie = useCookie('is_logged_in');
  // Hydrate user state for the first time (both on the SSR side and when refreshing the webpage)
  if (auth.value === null && loggedInCookie.value === 'true') {
    await fetchMe()
    if (auth.value) {
      await initialAppNav();
    }
  }


  if (auth.value && to.path === '/auth/login') {
    return navigateTo('/');
  }

  if (!auth.value && !loggedInCookie.value && to.path !== '/auth/login') { // if token doesn't exist redirect to log in
    abortNavigation();
    const continueQuery = to.fullPath
      ? `?continue=${!import.meta.server ? encodeURIComponent(to.fullPath) : to.fullPath}`
      : ''
    return navigateTo(`/auth/login${continueQuery}`)
  }
})
