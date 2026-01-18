import './globals.css';

export const metadata = {
  title: 'MTG Commander ROI - Precon Value Analyzer',
  description: 'Analyze the return on investment of Magic: The Gathering Commander preconstructed decks',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
