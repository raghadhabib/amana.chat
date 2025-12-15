'use client';

import { ChannelProvider } from 'ably/react';
import ChatUI from './ChatUI';

export default function ChatPage() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md">
        {/* Wrap ChatUI with ChannelProvider */}
        <ChannelProvider channelName="chat">
          <ChatUI />
        </ChannelProvider>
      </div>
    </div>
  );
}
