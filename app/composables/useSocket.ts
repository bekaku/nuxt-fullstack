import type { WebSocketBroadcast, WebSocketSubscribeType } from "~/types/common";
import { useWebSocket } from "@vueuse/core";

interface Options {
  onMessageReceived: (message: WebSocketBroadcast<any>) => void;
  type: WebSocketSubscribeType
  topic: string
  url?: string
}
export const useSocket = (options: Options) => {

  const wsUrl = import.meta.client
    ? options.url || `${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}/ws`
    : "";
  const { data, send, status, close, open } = useWebSocket(wsUrl, {
    autoReconnect: {
      retries: 3,
      delay: 1000,
      onFailed() {
        console.warn('Failed to connect WebSocket after 3 retries')
      },
    },
    heartbeat: {
      message: 'ping',
      interval: 30000, // Sends "ping" every 10s
      pongTimeout: 10000
    },
    immediate: import.meta.client,
    onMessage: (ws, event) => {
      if (event.data === 'ping' || event.data === 'pong') {
        return;
      }
      if (event.data) {

        try {
          const parsedMessage = JSON.parse(event.data);
          options.onMessageReceived(parsedMessage);
        } catch (e) {
          console.error("Failed to parse incoming socket message", e);
        }
      }
    }
  });

  const subscribeTopic = (type: WebSocketSubscribeType, topic: string) => {
    if (import.meta.client) {
      send(
        JSON.stringify({
          action: "SUBSCRIBE",
          type,
          topic,
        }),
      );
    }
  }
  const reconnect = () => {
    open();
    subscribeTopic(options.type, options.topic);
  }
  const broadcastEvent = <T,>(payload: WebSocketBroadcast<T>) => {
    send(
      JSON.stringify({
        action: "BROADCAST",
        payload,
      }),
    );
  };
  subscribeTopic(options.type, options.topic);

  if (import.meta.client) {
    onBeforeUnmount(() => {
      close();
    })
  }

  return {
    broadcastEvent,
    data,
    send,
    status,
    close,
    open,
    reconnect
  }
};
