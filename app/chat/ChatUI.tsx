'use client';

import { useEffect, useState, useRef } from 'react';
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

  const username =
    typeof window !== 'undefined'
      ? localStorage.getItem('chatUsername')
      : null;

  useEffect(() => {
    if (!username) router.push('/');
  }, [username, router]);

  // ✅ NOW SAFE: inside ChannelProvider
const { channel } = useChannel(
  'chat',
  'message',
  (msg) => {
    setMessages((prev) => [...prev, msg.data as ChatMessage]);
  }
);
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!channel || !messageText.trim()) return;

    channel.publish('message', {
      user: username,
      text: messageText.trim(),
      timestamp: Date.now(),
    });

    setMessageText('');
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  useEffect(() => {
  if (!username || username === 'anonymous-user') {
    router.replace('/');
  }
}, [username, router]);

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded max-w-xs ${
              msg.user === username
                ? 'bg-blue-500 text-black ml-auto'
                : 'bg-gray-300'
            }`}
          >
            <strong>{msg.user}: </strong>
            {msg.text}
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      <form
        onSubmit={sendMessage}
        className="flex border-t border-gray-300 p-2 bg-white"
      >
        <input
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded text-black bg-white"
        />
        <button
          type="submit"
          className="ml-2 bg-blue-500 p-2 rounded"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
