'use client';

import { AblyProvider } from 'ably/react';
import { Realtime as RealtimeConstructor } from 'ably';
import type { ConnectionStateChange } from 'ably';
import { useMemo } from 'react';

export function AblyClientProvider({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => {
    const clientId =
      typeof window !== 'undefined'
        ? localStorage.getItem('chatUsername') || 'anonymous-user'
        : 'anonymous-user';

    const ablyClient = new RealtimeConstructor({
      authUrl: '/api/auth',
      clientId,
    });

    ablyClient.connection.on((stateChange: ConnectionStateChange) => {
      if (stateChange.current === 'connected') {
        console.log(`✅ Ably connected as ${ablyClient.auth.clientId}`);
      }
    });

    return ablyClient;
  }, []);

  return <AblyProvider client={client}>{children}</AblyProvider>;
}
