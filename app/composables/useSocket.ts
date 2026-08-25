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
    // Frames sent before the socket reaches OPEN are silently dropped by
    // VueUse, so (re)subscribe to the topic on every successful connection,
    // including auto-reconnects.
    onConnected() {
      send(
        JSON.stringify({
          action: "SUBSCRIBE",
          type: options.type,
          topic: options.topic,
        }),
      );
    },
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

  const reconnect = () => {
    open();
  }
  const broadcastEvent = <T,>(payload: WebSocketBroadcast<T>) => {
    send(
      JSON.stringify({
        action: "BROADCAST",
        payload,
      }),
    );
  };

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
