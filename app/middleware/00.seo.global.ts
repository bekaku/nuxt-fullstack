export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) {
    return
  }
  const nuxtApp = useNuxtApp();

  const t = nuxtApp.$i18n?.t || ((str) => str);
  const pageName = to?.meta?.pageName;
  if (pageName) {
    useHead({
      title: t(pageName as string)
    })
  }
})
