export default defineNuxtPlugin(async () => {

    const { auth } = useAuth()

    if (auth.value)
        return

})
