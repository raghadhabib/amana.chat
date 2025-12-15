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

  // The Ably listener to receive messages
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

    // 1. Create the message object to be sent and displayed
    const newMessage: ChatMessage = {
      user: username ?? 'unknown',
      text: messageText.trim(),
      timestamp: Date.now(),
    };

    // 2. Publish to Ably
    channel.publish('message', newMessage);

    // 3. FIX: IMMEDIATELY add to local state for instant display
    setMessages(prev => [...prev, newMessage]);

    // 4. Clear input
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
        {messages.map((msg, i) => {
          // Format the timestamp for display (FIX: Time formatting)
          const time = new Date(msg.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={i}
              className={`p-2 rounded max-w-xs flex flex-col ${ // FIX: Use flex-col for clean structure
                msg.user === username
                  ? 'bg-blue-500 text-white ml-auto' // FIX: Text color contrast
                  : 'bg-gray-300 text-black'
              }`}
            >
              {/* Message Header (Username) */}
              <div className="text-sm font-bold mb-1">
                {msg.user === username ? 'You' : msg.user}
              </div>

              {/* Message Content and Time - Row layout */}
              <div className="flex justify-between items-end">
                <span className="text-base mr-4 whitespace-pre-wrap">
                  {msg.text}
                </span>
                <span className="text-xs opacity-75 min-w-max">
                  {time}
                </span>
              </div>
            </div>
          );
        })}
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
          className="ml-2 bg-blue-500 text-white p-2 rounded"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}