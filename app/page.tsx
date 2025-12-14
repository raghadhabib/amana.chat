// app/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useChannel, useAbly } from "ably/react";
import { Send } from 'lucide-react';

// --- CONFIGURATION for Two-User Test ---
// The two client IDs must be consistent with what's in AblyClientProvider.tsx,
// but they only need to be listed here. The CURRENT_USER_ID is determined at runtime.
const CLIENT_A_ID = 'self-user-A';
const CLIENT_B_ID = 'self-user-B';
const TARGET_NAME = 'Other User'; // Name for the person you are chatting with

// --- Interfaces for Component Props ---
interface ContactCardProps {
    id: string;
    name: string;
    status: 'Online' | 'Offline';
    lastMessage: string;
    isSelected: boolean;
}

interface MessageBubbleProps {
    user: string;
    text: string;
    timestamp: number;
}

// Utility to create a consistent channel name between two users
const getPrivateChannelName = (userId1: string, userId2: string): string => {
    // Sort IDs to ensure the channel name is the same regardless of who initiates the chat
    const sortedIds = [userId1, userId2].sort();
    return `chat:private:${sortedIds[0]}-${sortedIds[1]}`;
};

// --- Reusable Components (No changes needed, copied for completeness) ---

const ContactCard = ({ name, status, lastMessage, isSelected }: ContactCardProps) => (
    <div className={`flex items-center p-4 cursor-pointer transition-colors border-b border-zinc-200 ${isSelected ? 'bg-blue-100/70' : 'hover:bg-zinc-100'}`}>
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
            {name.charAt(0)}
        </div>
        <div className="flex-1 overflow-hidden">
            <div className="flex justify-between items-center">
                <p className="font-semibold text-zinc-900 truncate">{name}</p>
                <div className={`w-2 h-2 rounded-full ${status === 'Online' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            </div>
            <p className="text-sm text-zinc-500 truncate">{lastMessage}</p>
        </div>
    </div>
);

const MessageBubble = ({ user, text, timestamp, currentUserId }: MessageBubbleProps & { currentUserId: string }) => {
    const isSelf = user === currentUserId;
    const bubbleClasses = isSelf
        ? 'bg-blue-600 text-white rounded-tr-xl rounded-b-xl ml-auto'
        : 'bg-zinc-200 text-zinc-800 rounded-tl-xl rounded-b-xl mr-auto';

    // Format timestamp nicely
    const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'} mb-4 max-w-full`}>
            <div className={`p-3 max-w-xs sm:max-w-md break-words shadow-md ${bubbleClasses}`}>
                <p className="text-sm">{text}</p>
                <span className={`block text-xs mt-1 ${isSelf ? 'text-blue-200' : 'text-zinc-500'} text-right`}>
                    {time}
                </span>
            </div>
        </div>
    );
};


export default function ChatPage() {
    const [messages, setMessages] = useState<MessageBubbleProps[]>([]);
    const [messageText, setMessageText] = useState('');
    const messageEndRef = useRef<HTMLDivElement>(null);

    // 1. Determine current user ID from the Ably connection
    const ably = useAbly();
    const CURRENT_USER_ID = ably.auth.clientId;

    // 2. Determine the target user ID for the two-way chat test
    const TARGET_USER_ID = CURRENT_USER_ID === CLIENT_A_ID ? CLIENT_B_ID : CLIENT_A_ID;

    // Check if the client ID has been successfully authenticated/set
    const isClientReady = !!CURRENT_USER_ID && CURRENT_USER_ID !== 'anonymous';

    // 3. Determine the channel name for the private chat
    // Only calculate channel name if client is ready, otherwise use a placeholder
    const channelName = isClientReady ? getPrivateChannelName(CURRENT_USER_ID, TARGET_USER_ID) : 'chat:loading';

    // 4. Use the Ably useChannel hook
    const channelResult = useChannel(channelName, (message) => {
        // Cast message.data to the expected type to satisfy TypeScript
        setMessages(prev => [...prev, message.data as MessageBubbleProps]);
    });
    const channel = channelResult.channel;


    // Auto-scroll to the bottom of the message list
    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 5. The function to PUBLISH the message
    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        const text = messageText.trim();

        // Ensure the channel is active, client is ready, and there is text to send
        if (!channel || !text || !isClientReady) return;

        // Publish to the Ably channel
        channel.publish('message', {
            text: text,
            user: CURRENT_USER_ID, // Use the actual current user ID
            timestamp: Date.now(),
        });

        // Clear the input field
        setMessageText('');
    };

    // Check readiness using the channel state and client ID
    const isReady = isClientReady && channel && channel.state === 'attached';

    // Mock contact list for UI purposes
    const MOCK_CONTACTS: ContactCardProps[] = [
        { id: TARGET_USER_ID, name: TARGET_NAME, status: 'Online', lastMessage: 'Ready to test!', isSelected: true },
        { id: 'user-3', name: 'Bob Johnson', status: 'Offline', lastMessage: 'When will it be ready?', isSelected: false },
    ];
    
    // Show a loading screen until the Ably connection is established and the client ID is known
    if (!isClientReady) {
        return (
             <div className="flex h-screen items-center justify-center bg-zinc-50">
                <p className="text-xl font-medium text-zinc-700">Connecting to Ably...</p>
             </div>
        );
    }


    return (
        <div className="flex h-screen bg-zinc-50">

            {/* Sidebar (Contact List) */}
            <aside className="hidden md:block w-80 border-r border-zinc-300 bg-white flex-shrink-0 overflow-y-auto">
                <div className="p-4 border-b border-zinc-300">
                    <h1 className="text-xl font-bold text-zinc-800">My Chat App</h1>
                    <p className="text-sm text-green-500 font-medium">You are: **{CURRENT_USER_ID}** (Online)</p>
                </div>
                <div className="contacts-list">
                    {MOCK_CONTACTS.map(contact => (
                        <ContactCard key={contact.id} {...contact} />
                    ))}
                </div>
            </aside>

            {/* Main Chat Window */}
            <main className="flex flex-col flex-grow bg-white">

                {/* Chat Header */}
                <header className="p-4 border-b border-zinc-300 bg-zinc-50 flex items-center sticky top-0 z-10">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        {TARGET_NAME.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-zinc-900">{TARGET_NAME}</h2>
                        <p className="text-xs text-green-500">Online</p>
                    </div>
                </header>

                {/* Message Display Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center text-zinc-500 mt-10">Start chatting with {TARGET_NAME}!</div>
                    )}
                    {messages.map((message, index) => (
                        <MessageBubble key={index} {...message} currentUserId={CURRENT_USER_ID} />
                    ))}
                    <div ref={messageEndRef} />
                </div>

                {/* Typing Indicator / Status */}
                <div className="p-2 text-sm text-zinc-500 border-t border-zinc-200 h-8">
                    Status: {ably?.connection.state} - Channel: {channel?.state}
                    {!isReady && <span className="text-red-500">Connecting...</span>}
                </div>

                {/* Message Input Bar */}
                <footer className="p-4 border-t border-zinc-300 bg-white flex-shrink-0">
                    <form onSubmit={sendMessage} className="flex space-x-3">
                        <input
                            type="text"
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder={isReady ? "Type your message here..." : "Connecting..."}
                            className="flex-1 p-3 border border-zinc-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={!isReady}
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 text-white p-3 rounded-full w-12 h-12 flex items-center justify-center hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                            disabled={!isReady || messageText.trim() === ''}
                        >
                            <Send className="w-5 h-5 -ml-0.5" />
                        </button>
                    </form>
                </footer>

            </main>
        </div>
    );
}