import { AuthNoFilterPage } from '~/libs/constants';
export default defineNuxtRouteMiddleware(async (to) => {

  // 1.Filter routes that do not require authentication.
  if (typeof to.name !== 'string') return;
  const baseRouteName = to.name.replace(/___[a-z]{2}$/, '');
  if (AuthNoFilterPage.includes(baseRouteName)) return;

  const { auth } = useAuth();

  // 3. Prevent users from logging in and then returning to the login page.
  if (auth.value && to.path === '/auth/login') {
    return navigateTo('/');
  }

  // 4. Handling Redirects for Protected Pages
  // If there is no cookie, it means you are not actually logged in (checking cookies is the primary method for accuracy).
  if (!auth.value && to.path !== '/auth/login') {
    // encodeURIComponent here for URL verification.
    const continueQuery = encodeURIComponent(to.fullPath);
    return navigateTo(`/auth/login?continue=${continueQuery}`);
  }
})
