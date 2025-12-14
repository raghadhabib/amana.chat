// app/AblyClientProvider.tsx

'use client';

// 1. Import AblyProvider from the React package
import { AblyProvider } from 'ably/react';

// 2. Import the Realtime constructor and Types namespace directly from the main 'ably' package.
import { Realtime as RealtimeConstructor } from 'ably';
import type { Types } from 'ably'; // Import 'Types' namespace only for type checking

import { useMemo } from 'react';

// The type for the client is derived directly from the RealtimeConstructor
// This is the safest way to ensure the type matches the actual instance.
type AblyRealtimeClient = RealtimeConstructor;

// The Client ID used by this specific instance of the app
const ABLY_CLIENT_ID = 'self-user-A'; // <-- CHANGE TO 'self-user-B' IN A SECOND TAB FOR TESTING

export function AblyClientProvider({ children }: { children: React.ReactNode }) {

    // Use the derived type 'AblyRealtimeClient'
    const client = useMemo((): AblyRealtimeClient => {
        
        // Use the Realtime constructor directly
        const ablyClient = new RealtimeConstructor({ 
            authUrl: '/api/auth',
            clientId: ABLY_CLIENT_ID,
        });

        // Use Types.ConnectionStateChange from the top-level Types import for the listener
        ablyClient.connection.on((stateChange: Types.ConnectionStateChange) => {
            if (stateChange.current === 'connected') {
                console.log(`✅ Ably is connected and authenticated as ${ablyClient.auth.clientId}!`);
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