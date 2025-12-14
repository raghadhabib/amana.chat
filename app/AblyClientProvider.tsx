// app/AblyClientProvider.tsx
'use client';

// Use the modern, correct import path for the provider and hooks
import { AblyProvider } from 'ably/react'; 
import { Realtime } from 'ably';
import { useMemo } from 'react';

// Client ID used to generate the token
const ABLY_CLIENT_ID = 'self-user-123';

export function AblyClientProvider({ children }: { children: React.ReactNode }) {
    
    // Use useMemo to ensure the client instance is created only once (singleton)
    const client = useMemo(() => {
        // Create the Ably Realtime Client. It uses the serverless /api/auth route to get a token.
        const ablyClient = new Realtime({
            authUrl: '/api/auth',
            clientId: ABLY_CLIENT_ID,
        });

        // Optional: Add a connection status listener for debugging
        ablyClient.connection.on((stateChange) => {
            if (stateChange.current === 'connected') {
                console.log('✅ Ably is connected and authenticated!');
            }
        });

        return ablyClient;
        
    }, []); // Empty dependency array ensures it's only created once

    return (
        <AblyProvider client={client}>
            {children}
        </AblyProvider>
    );
}