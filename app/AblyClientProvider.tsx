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
  const [username, setUsername] = useState<string | null>(null);

  // Read username AFTER hydration
  useEffect(() => {
    const name = localStorage.getItem('chatUsername');
    setUsername(name);
  }, []);

  // Create Ably client ONLY when username exists
  useEffect(() => {
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
  }, [username]);

  if (!client) {
    return <div className="p-4">Connecting to chat…</div>;
  }

  return <AblyProvider client={client}>{children}</AblyProvider>;
}
