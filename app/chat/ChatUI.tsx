'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChannel } from 'ably/react';
import { Send } from 'lucide-react';

interface ChatMessage {
  user: string;
  text: string;
  timestamp: number;
}

export default function ChatUI() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const messageEndRef = useRef<HTMLDivElement>(null);

  // ✅ Get username
  const username =
    typeof window !== 'undefined'
      ? localStorage.getItem('chatUsername')
      : null;

  // ✅ Redirect if not logged in
  useEffect(() => {
    if (!username || username === 'anonymous-user') {
      router.replace('/');
    }
  }, [username, router]);

  // ✅ Ably channel listener
  const { channel } = useChannel('chat', 'message', (msg) => {
  setMessages((prev) => [...prev, msg.data as ChatMessage]);
});

  // ✅ Send message
  const sendMessage = (e: React.FormEvent) => {
  e.preventDefault();
  if (!channel || !messageText.trim()) return;

  const newMessage: ChatMessage = {
    user: username ?? 'unknown',
    text: messageText.trim(),
    timestamp: Date.now(),
  };

  channel.publish('message', newMessage);
  setMessageText('');
};

  // ✅ Auto scroll
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, i) => {
          const time = new Date(msg.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          const isMe = msg.user === username;

          return (
            <div
              key={i}
              className={`max-w-xs px-3 py-2 rounded-lg flex flex-col gap-1 ${
                isMe
                  ? 'bg-blue-500 text-white ml-auto'
                  : 'bg-gray-200 text-black mr-auto'
              }`}
            >
              {/* Username */}
              <span className="text-xs font-semibold opacity-80">
                {isMe ? 'You' : msg.user}
              </span>

              {/* Message text */}
              <p className="text-sm leading-snug break-words">
                {msg.text}
              </p>

              {/* Time */}
              <span className="text-[10px] opacity-70 self-end">
                {time}
              </span>
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="flex items-center border-t border-gray-300 p-2 bg-white"
      >
        <input
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded text-black bg-white focus:outline-none"
        />
        <button
          type="submit"
          className="ml-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
