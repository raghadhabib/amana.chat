'use client';

import { AblyProvider } from 'ably/react';
import { Realtime } from 'ably';
import { useEffect, useState } from 'react';

export function AblyClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client, setClient] = useState<Realtime | null>(null);

  useEffect(() => {
    const username = localStorage.getItem('chatUsername');

    if (!username) return;

    const ably = new Realtime({
      authUrl: `/api/auth?clientId=${username}`,
      clientId: username,
    });

    ably.connection.on('connected', () => {
      console.log(`✅ Ably connected as ${username}`);
    });

    setClient(ably);

    return () => {
      ably.close();
    };
  }, []);

  if (!client) {
    return <div className="p-4">Connecting to chat…</div>;
  }

  return <AblyProvider client={client}>{children}</AblyProvider>;
}
