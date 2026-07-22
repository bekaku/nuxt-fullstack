export default defineNuxtPlugin(async () => {

  const { auth, fetchMe } = useAuth()
  const { initialAppNav } = useMenu()

  if (auth.value)
    return
  const user = await fetchMe()

  if (user) {
    await initialAppNav()
  }

})
