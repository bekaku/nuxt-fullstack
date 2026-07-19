<script setup lang="ts">
import type { WebSocketBroadcast } from "~/types/common";
definePageMeta({
  layout: "default",
});
useSeoMeta({
  title: "Chat page",
});
interface GroupChatMsgDto {
  id: string;
  text: string;
  senderId: number;
  createdAt: string;
}
const currentChatRoom = "room_999";
const api = useApi();
const onSocketReceived = (
  message: WebSocketBroadcast<GroupChatMsgDto | string | null>,
) => {
  console.log("onSocketReceived", message);
  if (!message) return;

  switch (message.socketType) {
    case "CHAT_MESSAGE":
      break;
    case "CHAT_MESSAGE_REACTION":
      break;
    case "CHAT_MESSAGE_UNSEND":
      break;
    case "CHAT_MESSAGE_READ":
      break;
    case "CHAT_MESSAGE_READ_ALL":
      break;
    case "CHAT_MESSAGE_TYPING":
      break;
    case "CHAT_GROUP_USER_INVITE":
      break;
    case "CHAT_GROUP_USER_LEAVE":
      break;
  }
};
const { broadcastEvent, status, close, reconnect } = useSocket({
  type:'CHAT_MESSAGE',
  topic: currentChatRoom,
  onMessageReceived: onSocketReceived,
});
const handleSendText = () => {
  broadcastEvent<GroupChatMsgDto>({
    socketType: "CHAT_MESSAGE",
    topic: currentChatRoom,
    userId: 1, // ID ของตัวเราเอง
    data: {
      id: "msg-001",
      text: "สวัสดีครับทุกคน",
      senderId: 1,
      createdAt: new Date().toISOString(),
    },
  });
};

const handleTyping = () => {
  broadcastEvent<null>({
    socketType: "CHAT_MESSAGE_TYPING",
    topic: currentChatRoom,
    userId: 1,
    additionalMessage: "1", //isTyping.value ? '1' : '0',
  });
};

const testSendFromServer = async () => {
  try {
    await api<any>("/api/test-socket-send", {
      method: "POST",
      body: {
        topic: currentChatRoom,
        senderId: 1,
        text: "Hello broadcast event from Server",
      },
    });
    // console.log('response', response)
  } catch (error) {
    console.error("Failed to fetch profile", error);
  }
};
</script>

<template>
  <BaseDashboardPanel id="example-chats" title="Chat page">
    <div class="flex h-full gap-4">
      <div>
        Web socket status: <UBadge color="success">{{ status }}</UBadge>
      </div>
      <UButton class="w-fit" icon="lucide:send" @click="handleSendText"
        >Send Text</UButton
      >
      <UButton class="w-fit" icon="lucide:pen-line" @click="handleTyping"
        >Typing</UButton
      >
      <UButton
        class="w-fit"
        icon="lucide:radio-tower"
        @click="testSendFromServer"
        >Send from server</UButton
      >
      <UButton
        class="w-fit"
        icon="lucide:x"
        color="error"
        variant="outline"
        @click="
          () => {
            close();
          }
        "
        >Disconnect</UButton
      >
      <UButton
        class="w-fit"
        icon="lucide:refresh-cw"
        color="primary"
        variant="outline"
        @click="
          () => {
            reconnect();
          }
        "
        >Reconnect</UButton
      >
    </div>
  </BaseDashboardPanel>
</template>
