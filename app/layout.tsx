import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MTG Commander ROI - Precon Value Analyzer',
  description: 'Analyze the return on investment of Magic: The Gathering Commander preconstructed decks',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
