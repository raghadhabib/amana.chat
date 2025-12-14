// app/AblyClientProvider.tsx (New, Correct Imports)

'use client';

import { AblyProvider } from 'ably/react'; 
// FIX 1: Import the Realtime.Promise constructor directly
import { Realtime as RealtimePromise } from 'ably'; 
// FIX 2: Use the Types namespace from the main 'ably' package (cleaner than path import)
import * as Types from 'ably/modules/types/default'; 

import { useMemo } from 'react';
// ...

// Client ID used to generate the token
const ABLY_CLIENT_ID = 'self-user-123';

export function AblyClientProvider({ children }: { children: React.ReactNode }) {
    
    const client = useMemo(() => {
        // FIX: Use the imported name RealtimePromise directly as the constructor
        const ablyClient = new RealtimePromise({ 
            authUrl: '/api/auth',
            clientId: ABLY_CLIENT_ID,
        });

        // FIX APPLIED HERE: Added type annotation (stateChange: Types.ConnectionStateChange)
        ablyClient.connection.on((stateChange: Types.ConnectionStateChange) => {
            if (stateChange.current === 'connected') {
                console.log('✅ Ably is connected and authenticated!');
            }
        });

        return ablyClient;
        
    }, []); 

    return (
        <AblyProvider client={client}>
            {children}
        </AblyProvider>
    );
}