import { useEffect, useRef, useState } from "react";

// One shared Server-Sent Events connection for the whole dashboard. The
// backend broadcasts topics ("appointments", "doctors", "messages",
// "medicines", "orders") whenever any staff member changes data; every page
// subscribed to a topic refetches, so other PCs see changes without a refresh.
const EVENTS_URL = `${import.meta.env.VITE_API_URL || ""}/api/v1/events`;

const listeners = new Set();
const statusListeners = new Set();
let source = null;
let retryTimer = null;
let connected = false;

const setConnected = (value) => {
  connected = value;
  statusListeners.forEach((fn) => fn(value));
};

const notify = (topics) => {
  for (const { topics: wanted, fn } of listeners) {
    if (!topics || wanted.some((t) => topics.includes(t))) fn();
  }
};

const open = () => {
  if (source || listeners.size === 0) return;
  source = new EventSource(EVENTS_URL, { withCredentials: true });
  source.onopen = () => {
    // Refetch everything once on (re)connect to catch changes missed while offline
    if (!connected) notify(null);
    setConnected(true);
  };
  source.onmessage = (event) => {
    try {
      notify(JSON.parse(event.data).topics);
    } catch {
      // ignore malformed events
    }
  };
  source.onerror = () => {
    setConnected(false);
    // The browser retries by itself unless the server refused (e.g. logged out)
    if (source.readyState === EventSource.CLOSED) {
      close();
      retryTimer = setTimeout(open, 5000);
    }
  };
};

const close = () => {
  clearTimeout(retryTimer);
  source?.close();
  source = null;
};

// Calls `onUpdate` whenever one of `topics` changes on the server
export const useLiveUpdates = (topics, onUpdate) => {
  const callback = useRef(onUpdate);
  callback.current = onUpdate;
  const key = topics.join(",");

  useEffect(() => {
    const listener = { topics: key.split(","), fn: () => callback.current() };
    listeners.add(listener);
    open();
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) {
        close();
        setConnected(false);
      }
    };
  }, [key]);
};

export const LiveBadge = () => {
  const [isLive, setIsLive] = useState(connected);
  useEffect(() => {
    statusListeners.add(setIsLive);
    return () => statusListeners.delete(setIsLive);
  }, []);
  return (
    <span
      className={`live-badge ${isLive ? "on" : ""}`}
      title={
        isLive
          ? "Changes made on other PCs appear here automatically"
          : "Reconnecting… changes from other PCs will appear when connected"
      }
    >
      {isLive ? "● Live" : "○ Reconnecting"}
    </span>
  );
};
