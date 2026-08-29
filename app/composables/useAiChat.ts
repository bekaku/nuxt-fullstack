import type { ApiResponse } from '~/types/common'
import type { AiChat, AiChatMessage, ChatMessage } from '~/types/models'
import { useChat } from '@ai-sdk/vue'
import { DefaultChatTransport } from 'ai'

export type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error'
export type ChatAction = 'delete' | 'rename'

interface AiChatOptions {
  bottomAnchor?: Ref<HTMLElement | null>
  chatContainerRef?: Ref<HTMLElement | null>
}

export const useAiChat = (options: AiChatOptions = {}) => {
  const { t } = useLang()
  const recentChats = useState<AiChat[]>('ai:recent', () => []);
  const chatAction = useState<ChatAction | undefined>('ai:chat:action', () => undefined);
  const chatActionItem = useState<AiChat | undefined>('ai:chat:item', () => undefined);
  const currentChat = ref<AiChat | undefined>({
    title: t('chats.newChat'),
    updatedDate: '',
    pin: false
  });

  const chatTitle = ref(t('chats.newChat'))
  const conversationId = ref<string | null>(null)



  const confirm = useConfirmDialog();
  const { onReplaceUrl } = useBase();
  const api = useApi()

  const loading = ref(true);
  const loadingMore = ref(false)
  const page = ref(0)
  const size = ref(10)
  const isLastPage = ref(true)


  const {
    messages,
    status,
    error,
    sendMessage: sendChatMessage,
    stop,
    regenerate
  } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/aiChat/stream',
      fetch: async (url, options) => {

        const response = await api.raw(url as string, {
          ...options,
          method: options?.method as "POST" | "GET" | "PUT" | "DELETE" | undefined,
          responseType: 'stream'
        });

        return new Response(response._data as ReadableStream, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      }
    }),
    onData(dataPart) {

      console.log('dataPart', dataPart)
      if (dataPart.type === 'data-chat-id') {
        // @ts-ignore
        const newChatId = dataPart.data?.message
        if (newChatId) {
          conversationId.value = newChatId
          onReplaceUrl(`/ai-chats/c/${newChatId}`)
        }
      }
      if (dataPart.type === 'data-chat-title') {
        // @ts-ignore
        const newTitle = dataPart.data?.message
        if (newTitle) {
          chatTitle.value = newTitle
        }

        console.log('newTitle', newTitle)
        currentChat.value = {
          id: conversationId.value,
          title: chatTitle.value,
          updatedDate: new Date().toISOString(),
          pin: false
        }
        recentChats.value.unshift(currentChat.value);
      }
    },
    onError(err) {
      console.error('Chat error:', err)
    }
  })

  const mapDbMessage = (message: AiChatMessage) => ({
    id: message.id?.toString() ?? crypto.randomUUID(),
    role: (message.aiRole as string).toLowerCase(),
    content: message.content,
    parts: [
      {
        type: 'text',
        text: message.content
      }
    ],
    thinkingContent: undefined,
    isThinkingDone: true,
    isThinkingOpen: false,
    avatar: message.aiRole?.toLowerCase() === 'assistant'
      ? {
        icon: 'hugeicons:ai-magic',
        color: 'primary'
      }
      : undefined,
    // TODO: map จาก message.sources จริงถ้า backend เก็บไว้ ตอนนี้ hardcode ว่าง
    sources: []
  })

  const initialMessage = async () => {

    if (!conversationId.value) {
      return;
    }



    const requestedConversationId = conversationId.value
    page.value = 0
    isLastPage.value = false
    loadingMore.value = false
    loading.value = true
    messages.value = []
    try {
      // @ts-ignore
      const response = await api<ResponseEntity<ApiResponse<AiChatMessage>>>(
        `/api/aiChat/messages/${requestedConversationId}?page=${page.value}&sort=id,desc&size=${size.value}` as string,
        { method: 'GET' }
      )
      console.log('response', response)

      const data = response.data;
      if (conversationId.value !== requestedConversationId) return

      isLastPage.value = data.last;
      if (data && data?.dataList?.length) {
        const mapped = [...data.dataList].reverse().map(mapDbMessage)
        console.log('mapped', mapped)
        // @ts-ignore
        messages.value = mapped
      }

      if (conversationId.value !== requestedConversationId) return

      if (recentChats.value && recentChats.value.length > 0) {
        const chat = recentChats.value.find((item) => item.id === requestedConversationId);
        if (chat) {
          currentChat.value = chat;
        }
      }

    } catch (error) {
      console.error('Failed to fetch messages', error);
    } finally {
      if (conversationId.value === requestedConversationId) {
        loading.value = false;
      }
    }
  }
  const loadMoreMessages = async () => {
    if (!conversationId.value || isLastPage.value || loadingMore.value) return;

    const requestedConversationId = conversationId.value
    loadingMore.value = true;
    page.value++;

    try {
      // @ts-ignore
      const response = await api<ResponseEntity<ApiResponse<AiChatMessage>>>(
        `/api/aiChat/messages/${requestedConversationId}?page=${page.value}&sort=id,desc&size=${size.value}`,
        { method: 'GET' }
      );
      const data = response.data;
      if (conversationId.value !== requestedConversationId) return

      isLastPage.value = data.last;

      if (data && data?.dataList?.length) {
        const olderMessages = [...data.dataList].reverse().map(mapDbMessage);

        const scrollContainer = getScrollParent(options?.chatContainerRef?.value ?? null);
        const previousScrollHeight = scrollContainer ? scrollContainer.scrollHeight : 0;

        // @ts-ignore
        messages.value = [...olderMessages, ...messages.value];

        await nextTick();
        if (scrollContainer) {
          const currentScrollHeight = scrollContainer.scrollHeight;
          scrollContainer.scrollTop += (currentScrollHeight - previousScrollHeight);
        }
      }
    } catch (error) {
      console.error('Failed to fetch more messages', error);
      if (conversationId.value === requestedConversationId) {
        page.value--;
      }
    } finally {
      if (conversationId.value === requestedConversationId) {
        loadingMore.value = false;
      }
    }
  }

  function getScrollParent(node: HTMLElement | null): HTMLElement | null {
    let parent = node?.parentElement ?? null
    while (parent) {
      const { overflowY } = getComputedStyle(parent)
      if (/(auto|scroll)/.test(overflowY) && parent.scrollHeight > parent.clientHeight) {
        return parent
      }
      parent = parent.parentElement
    }
    return document.scrollingElement as HTMLElement | null
  }

  const sendMessage = (text: string, filterNames: string[] = []) => {
    if (!text.trim()) return

    sendChatMessage(
      { text },
      {
        body: {
          conversationId: conversationId.value,
          filterNames
        }
      }
    )
  }

  const getItemById = (chatId: string) => recentChats.value.find((item) => item.id === chatId)

  const onPin = async (chatId: string) => {
    const item = getItemById(chatId);
    if (item) {
      item.pin = true;
      await onUpdateChat(item);
    }
  };
  const onUnPin = async (chatId: string) => {
    const item = getItemById(chatId);
    if (item) {
      item.pin = false;
      await onUpdateChat(item);
    }
  };

  const onRenameChat = async (chat: AiChat) => {
    if (chat && chat.id) {
      await onUpdateChat(chat);
      const item = getItemById(chat.id as string);
      if (item) {
        item.title = chat.title;
      }
      chatAction.value = 'rename'
      chatActionItem.value = item
    }
  };

  const onDeleteChat = async (id: string) => {
    const conf = await confirm({
      title: t("base.deleteCountConfirm", { count: 1 }),
      description: t("base.deleteConfirmHelp"),
      confirmButton: {
        label: t("base.delete"),
        color: "error",
        icon: "lucide:trash",
      },
    });
    if (!conf) {
      return
    }
    try {
      await api<void>(`/api/aiChat/${id}`, {
        method: 'DELETE',
      });
      const item = getItemById(id as string);
      chatActionItem.value = item
      chatAction.value = 'delete'
      recentChats.value = recentChats.value.filter((item) => item.id !== id);

    } catch (error) {
      console.error('Failed', error);
    }
  }

  const onUpdateChat = async (item: AiChat) => {
    try {
      await api<void>(`/api/aiChat/${item.id}`, {
        method: 'PUT',
        body: item
      });
    } catch (error) {
      console.error('Failed', error);
    }
  }

  const scrollToBottom = async () => {
    await nextTick();
    setTimeout(() => {
      if (options.bottomAnchor?.value) {
        options.bottomAnchor.value.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }
    }, 100);
  };

  return {
    recentChats,
    messages,
    status,
    error,
    conversationId,
    chatTitle,
    loading,
    loadingMore,
    chatAction,
    chatActionItem,
    currentChat,
    isLastPage,
    getItemById,
    sendMessage,
    stop,
    regenerate,
    onPin,
    onUnPin,
    onDeleteChat,
    initialMessage,
    scrollToBottom,
    onUpdateChat,
    onRenameChat,
    loadMoreMessages
  }
}
