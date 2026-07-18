import type { FetchResponse } from 'ofetch';
import type { AppException, RefreshTokenResponse, ResponseMessage } from '~/types/common';

let refreshPromise: Promise<RefreshTokenResponse> | null = null

export const useApi = () => {
  const { apiBase, apiClient, isDevMode, isServer } = useConfiguration()
  const localeCookie = useCookie('locale');
  const toast = useToast()

  const getBaseHeaders = () => {
    return {
      // 'X-User-ID': currentUserId.value + '',
      'Accept-Apiclient': apiClient,
      'Accept-Language': localeCookie.value || 'en'
    }
  }

  const handleLogout = async () => {
    refreshPromise = null

    if (import.meta.client) {
      await navigateTo('/auth/login')
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

    },
    async onResponse({ request, response, options }) {
      if (isDevMode() && !isServer()) {
        console.log("[fetch response]", { request, options, response });
      }
      if (response.status != 401 && response.status != 403) {
        exeptionNotify(response);
      }
    },
  })

  const exeptionNotify = (response: any) => {
    if (response && response._data) {
      if (isAppException(response._data)) {
        notifyMessage(response._data);
      } else if (isServerResponseMessage(response._data)) {
        notifyServerMessage(response._data);
      }
    }
  };

  const notifyMessage = (response: AppException | null): void => {
    if (import.meta.server || response == null) {
      return;
    }

    toast.add({
      title: h('span', { class: 'text-red-500 font-bold' }, response.message),
      description: response.errors?.length
        ? h(
          'ul',
          { class: 'list-disc list-inside space-y-1 mt-1 text-gray-600 dark:text-gray-300' },
          response.errors.map(errorText => h('li', errorText))
        )
        : undefined,
      icon: 'lucide:octagon-alert',
      color: 'error',
    })
  };

  const notifyServerMessage = (response: ResponseMessage): void => {
    if (import.meta.server || !response.message) {
      return;
    }

    toast.add({
      description: response.message,
      icon: response.status == '200 OK' || response.status == '201 Created' ? 'lucide:circle-check' : 'i-lucide-alert-circle',
      color: response.status == '200 OK' || response.status == '201 Created' ? 'success' : 'error',
    })
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

        if (!refreshPromise) {
          refreshPromise = $fetch<RefreshTokenResponse>('/api/auth/refresh', {
            baseURL: apiBase as string,
            method: 'POST',
            headers: getBaseHeaders(),
          }).then(async (res) => {
            return res;
          }).catch(async (err) => {
            await handleLogout();
            throw err;
          }).finally(() => {
            refreshPromise = null;
          });
        }

        try {
          const newAccessToken = await refreshPromise;

          // Copy the options to prevent affecting the source object.
          const retryOptions = { ...options };
          retryOptions.headers = new Headers(retryOptions.headers);

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
