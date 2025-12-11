'use client'; // <-- This directive makes it a client component

import React, { useState, useEffect, useRef } from 'react';
import { useChannel } from "@ably-labs/react-hooks";
import { Send } from 'lucide-react'; // Using Lucide icon for the send button

// Change these lines at the top of app/page.js
const SENDER_ID = 'alice-user-456'; // Alice is now the sender
const RECEIVER_ID = 'self-user-123'; // The original user is now the receiver
const RECEIVER_NAME = 'Original User'; // Display name

// Utility to create a consistent channel name between two users
const getPrivateChannelName = (userId1, userId2) => {
  // Sort IDs to ensure the channel name is the same regardless of who initiates the chat
  const sortedIds = [userId1, userId2].sort();
  return `chat:private:${sortedIds[0]}-${sortedIds[1]}`;
};

// --- Reusable Components (Simplified for integration) ---

const ContactCard = ({ name, status, lastMessage, isSelected }) => (
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

const MessageBubble = ({ user, text, timestamp }) => {
    const isSelf = user === SENDER_ID;
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
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const messageEndRef = useRef(null);

    // 1. Determine the channel name for the private chat
    const channelName = getPrivateChannelName(SENDER_ID, RECEIVER_ID);
    
    // 2. Use the Ably useChannel hook
    const [channel, ably] = useChannel(channelName, (message) => {
        // This callback fires when a new message is received
        // It's crucial that the message.data object matches what we publish
        setMessages(prev => [...prev, message.data]);
    });

    // Auto-scroll to the bottom of the message list
    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 3. The function to PUBLISH the message
    const sendMessage = (e) => {
        e.preventDefault();
        const text = messageText.trim();
        
        // Ensure the channel is active and there is text to send
        if (!channel || !text) return;

        // Publish to the Ably channel
        channel.publish('message', {
            text: text,
            user: SENDER_ID,
            timestamp: Date.now(),
        });

        // Clear the input field
        setMessageText('');
    };
    
    const isReady = channel && channel.state === 'attached';

    // Mock contact list for UI purposes
    const MOCK_CONTACTS = [
        { id: RECEIVER_ID, name: RECEIVER_NAME, status: 'Online', lastMessage: 'Ready to test!', isSelected: true },
        { id: 'user-3', name: 'Bob Johnson', status: 'Offline', lastMessage: 'When will it be ready?', isSelected: false },
    ];


    return (
        <div className="flex h-screen bg-zinc-50">
            
            {/* Sidebar (Contact List) */}
            <aside className="hidden md:block w-80 border-r border-zinc-300 bg-white flex-shrink-0 overflow-y-auto">
                <div className="p-4 border-b border-zinc-300">
                    <h1 className="text-xl font-bold text-zinc-800">My Chat App</h1>
                    <p className="text-sm text-green-500 font-medium">You are: {SENDER_ID.split('-')[0]} (Online)</p>
                </div>
                <div className="contacts-list">
                    {MOCK_CONTACTS.map(contact => (
                        <ContactCard key={contact.id} {...contact} isSelected={contact.id === RECEIVER_ID} />
                    ))}
                </div>
            </aside>

            {/* Main Chat Window */}
            <main className="flex flex-col flex-grow bg-white">
                
                {/* Chat Header */}
                <header className="p-4 border-b border-zinc-300 bg-zinc-50 flex items-center sticky top-0 z-10">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        {RECEIVER_NAME.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-zinc-900">{RECEIVER_NAME}</h2>
                        <p className="text-xs text-green-500">Online</p>
                    </div>
                </header>

                {/* Message Display Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center text-zinc-500 mt-10">Start chatting with {RECEIVER_NAME}!</div>
                    )}
                    {messages.map((message, index) => (
                        <MessageBubble key={index} {...message} />
                    ))}
                    <div ref={messageEndRef} />
                </div>
                
                {/* Typing Indicator (Placeholder) */}
                <div className="p-2 text-sm text-zinc-500 border-t border-zinc-200 h-8">
                    {/* Status: {ably?.connection.state} - Channel: {channel?.state} */}
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