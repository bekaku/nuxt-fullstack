import type { ApiResponse } from "~/types/common";
import type { GroupChat, GroupChatMsg } from "~/types/models";


type Action = 'MESSAGE_FOCUS' | 'GROUP_PIN' | 'GROUP_UNPIN' | 'GROUP_MUTED' | 'GROUP_UNMUTED'
export const useAppChat = () => {

  const chatHistory = useState<GroupChat[]>('chat:history', () => []);
  const chatAction = useState<Action | undefined>('chat:action', () => undefined);
  const chatActionGroup = useState<GroupChat | undefined>('chat:action:group', () => undefined);
  const chatActionMessage = useState<GroupChatMsg | undefined>('message', () => undefined);
  const isChatNotificationsSlideoverOpen = useState<boolean>('chat:notificationsSlideoverOpen', () => false);

  const openMiniChatPage = useState<boolean>('chat:openMiniChatPage', () => false);
  const miniChatGroupId = useState<string | undefined>('chat:miniChatGroupId', () => undefined);
  const miniChatMinimize = ref(false);

  const isInitial = ref(false);
  const initHistoryData = async () => {
    if (chatHistory.value.length) {
      isInitial.value = true
      return;
    }
    const items = await $fetch<ApiResponse<GroupChat>>('/api/mock/chat/chatHistoryListApi', {
      method: 'GET',
    })
    isInitial.value = true
    chatHistory.value = items.dataList
  }

  const onClearMessageFocus = () => {
    chatAction.value = undefined;
    chatActionMessage.value = undefined;
  }

  const onSetMessageFocus = (action: Action, item: GroupChatMsg) => {
    chatActionMessage.value = item;
    chatAction.value = action;
  }

  const onOpenMiniChat = (chatId: string | undefined) => {
    if (!chatId) {
      return;
    }
    miniChatGroupId.value = chatId;
    openMiniChatPage.value = true;
    miniChatMinimize.value = false;
  };
  const onCloseMiniChatPage = () => {
    openMiniChatPage.value = false;
    miniChatGroupId.value = undefined;
    miniChatMinimize.value = false;
  };
  const isCurrentOpenMiniChatByGroupId = (groupChatId: bigint | string) => {
    if (!groupChatId) {
      return false;
    }
    return openMiniChatPage.value && miniChatGroupId.value && miniChatGroupId.value == groupChatId;
  };
  return {
    chatHistory,
    isInitial,
    chatAction,
    chatActionGroup,
    chatActionMessage,
    initHistoryData,
    onClearMessageFocus,
    onSetMessageFocus,
    isChatNotificationsSlideoverOpen,
    miniChatGroupId,
    openMiniChatPage,
    miniChatMinimize,
    onOpenMiniChat,
    onCloseMiniChatPage,
    isCurrentOpenMiniChatByGroupId
  }

}
