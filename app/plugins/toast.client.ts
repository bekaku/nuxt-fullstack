// plugins/toast.client.ts
export default defineNuxtPlugin(() => {
  const toast = useToast();

  return {
    provide: {
      toast
    }
  }
});
