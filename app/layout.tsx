import './globals.css';
import { AblyClientProvider } from './AblyClientProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AblyClientProvider>{children}</AblyClientProvider>
      </body>
    </html>
  );
}
