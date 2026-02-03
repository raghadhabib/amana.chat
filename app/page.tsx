"use client";

import { useEffect, useRef, useState } from "react";
import { ably } from "./lib/ably";
import { ChatMessage } from "./types";

export default function Page() {
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Subscribe to messages when joined
  useEffect(() => {
    if (!joined) return;

    const channel = ably.channels.get("global-chat");

    // Load last 50 messages
    const loadHistory = async () => {
      const result = await channel.history({ limit: 50 });
      const historyMessages = result.items
        .map((item) => item.data as ChatMessage)
        .reverse();
      setMessages(historyMessages);
    };
    loadHistory();

    // Listen for new messages
    channel.subscribe((msg) => {
      setMessages((prev) => [...prev, msg.data as ChatMessage]);
    });

    return () => {
      channel.unsubscribe();
    };
  }, [joined]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send a message
  const sendMessage = async () => {
    if (!input.trim()) return;

    const channel = ably.channels.get("global-chat");

    await channel.publish("message", {
      text: input,
      username,
      time: new Date().toISOString(),
    });

    setInput("");
  };

  // Join screen
  if (!joined) {
    return (
      <div>
        <h2>Join Chat</h2>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
        />
        <button
          disabled={!username.trim()}
          onClick={() => setJoined(true)}
        >
          Join
        </button>
      </div>
    );
  }

  // Chat UI (you can fully style this)
  return (
    <div>
      <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
        {messages.map((m, i) => (
          <div key={i}>
            <b>{m.username}:</b> {m.text} <i>({new Date(m.time).toLocaleTimeString()})</i>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
