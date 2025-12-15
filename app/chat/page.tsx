'use client';

import { ChannelProvider } from 'ably/react';
import ChatUI from './ChatUI';

export default function ChatPage() {
  return (
    <ChannelProvider channelName="chat">
      <ChatUI />
    </ChannelProvider>
  );
}
