import type { FetchResponse } from 'ofetch';
import type { AppException, ResponseEntity, ResponseMessage } from '~/types/common';
import type { AppUser } from '~/types/models';
import { parse, parseSetCookie } from 'cookie-es';

// let refreshPromise: Promise<ResponseEntity<AppUser>> | null = null

export const useApi = () => {
  const { apiBase, apiClient, isDevMode, isServer } = useConfiguration()
  const localeCookie = useCookie('locale');
  const event = import.meta.server ? useRequestEvent() : null;
  const requestHeaders = import.meta.server ? useRequestHeaders(['cookie']) : {};
  const responseCookies = new Map<string, string>();
  // const { $toast } = useNuxtApp()

  const toast = import.meta.client ? useToast() : null;
  const { refreshTokenDays } = useConfiguration()
  const ttlDays = Number(refreshTokenDays) || 7;
  const nuxtApp = useNuxtApp();

  const getBaseHeaders = () => {
    return {
      // 'X-User-ID': currentUserId.value + '',
      'Accept-Apiclient': apiClient,
      'Accept-Language': localeCookie.value || 'en'
    }
  }

  const handleLogout = async () => {
    nuxtApp._refreshPromise = null;

    if (import.meta.client) {
      await navigateTo('/auth/login');
    }
  }

  const baseFetch = $fetch.create({
    baseURL: apiBase as string,
    async onRequest({ options }) {
      options.headers = new Headers(options.headers)
      const baseHeaders = getBaseHeaders();
      for (const [key, value] of Object.entries(baseHeaders)) {
        options.headers.set(key, value);
      }

      options.credentials = options.credentials || 'include';
      if (import.meta.server && options.credentials === 'include') {
        if (!options.headers.has('cookie')) {
          if (requestHeaders.cookie) {
            options.headers.set('cookie', requestHeaders.cookie as string);
          }
        }
      }
    },
    async onResponse({ request, response, options }) {
      if (isDevMode() && !isServer()) {
        console.log("[fetch response]", { request, options, response });
      }
      if (response.status != 401 && response.status != 403) {
        // exeptionNotify(response);
        nuxtApp.runWithContext(() => exeptionNotify(response));
      }
    },
  })

  const exeptionNotify = (response: any) => {
    if (response && response._data) {
      notifyServerMessage(response._data);
    }
  };

  // const notifyMessage = (response: AppException | null): void => {
  //   if (import.meta.server || response == null) {
  //     return;
  //   }

  //   toast.add({
  //     title: h('span', { class: 'text-red-500 font-bold' }, response.message),
  //     description: response.errors?.length
  //       ? h(
  //         'ul',
  //         { class: 'list-disc list-inside space-y-1 mt-1 text-gray-600 dark:text-gray-300' },
  //         response.errors.map(errorText => h('li', errorText))
  //       )
  //       : undefined,
  //     icon: 'lucide:octagon-alert',
  //     color: 'error',
  //   })
  // };

  const notifyServerMessage = (response: ResponseEntity<any>): void => {
    // if (import.meta.server || !response?.message || !toast) {
    if (import.meta.client && response?.message && toast) {
      toast.add({
        description: response.message,
        icon: response.status < 400 ? 'lucide:circle-check' : 'i-lucide-alert-circle',
        color: response.status < 400 ? 'success' : 'error',
      })
    }
  }

  // A central function for handling both normal and raw requests.
  const executeFetch = async <T = any, R extends boolean = false>(
    request: Parameters<typeof $fetch>[0],
    options: Parameters<typeof $fetch>[1] | undefined,
    isRaw: R
  ): Promise<R extends true ? FetchResponse<T> : T> => {

    // Define the method for calling Fetch.
    const callApi = (opts: any) => isRaw ? baseFetch.raw<T>(request, opts) : baseFetch<T>(request, opts);

    try {
      return (await callApi(options)) as any;
    } catch (error: any) {

      if (error.response?.status === 401) {
        if (!nuxtApp._refreshPromise) {
          const refreshHeaders = new Headers();

          Object.entries(getBaseHeaders()).forEach(([k, v]) => {
            refreshHeaders.set(k, v);
          });

          if (import.meta.server && requestHeaders.cookie) {
            refreshHeaders.set('cookie', requestHeaders.cookie as string);
          }


          nuxtApp._refreshPromise = $fetch<ResponseEntity<AppUser>>('/api/auth/refresh', {
            baseURL: apiBase as string,
            method: 'POST',
            headers: refreshHeaders,
            credentials: 'include',
            onResponse({ response }) {

              if (!import.meta.server) {
                return;
              }
              if (!event) {
                return;
              }
              const cookies =
                (response.headers as any).getSetCookie?.() ??
                (response.headers.get('set-cookie')
                  ? [response.headers.get('set-cookie')!]
                  : []);

              if (cookies.length) {
                event.node.res.setHeader('set-cookie', cookies);

                for (const cookie of cookies) {
                  const parsed = parseSetCookie(cookie);
                  if (parsed) {

                    responseCookies.set(parsed.name, parsed.value);
                  }
                }
              }
            }
          })
            .then(async (res) => {
              if (isDevMode() && !isServer()) {
                console.warn("[refresh token] res", res);
              }
              return res;
            }).catch(async (err) => {
              if (isDevMode() && !isServer()) {
                console.warn("[refresh token] err", err);
              }
              await handleLogout();
              throw err;
            }).finally(() => {
              nuxtApp._refreshPromise = null;
            });
        }

        try {
          await nuxtApp._refreshPromise;
          // Copy the options to prevent affecting the source object.
          const retryOptions = { ...options };
          retryOptions.headers = new Headers(retryOptions.headers);

          if (import.meta.server) {
            const cookies = parse((requestHeaders.cookie as string) || '');

            for (const [name, value] of responseCookies) {
              cookies[name] = value;
            }
            retryOptions.headers.set(
              'cookie',
              Object.entries(cookies)
                .map(([k, v]) => `${k}=${v}`)
                .join('; ')
            );
          }

          return (await callApi(retryOptions)) as any;
        } catch (retryError) {
          return Promise.reject(retryError);
        }
      }

      return Promise.reject(error);
    }
  };

  // Calling the normal pattern.
  const customApiFetch = async <T = any>(
    request: Parameters<typeof $fetch>[0],
    options?: Parameters<typeof $fetch>[1]
  ) => {
    return executeFetch<T, false>(request, options, false);
  }

  // Using the raw format to extract the full response data.
  customApiFetch.raw = async <T = any>(
    request: Parameters<typeof $fetch>[0],
    options?: Parameters<typeof $fetch>[1]
  ): Promise<FetchResponse<T>> => {
    return executeFetch<T, true>(request, options, true);
  }

  return customApiFetch;
}
