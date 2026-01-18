import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-bold text-purple-400 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
        <p className="text-slate-400 mb-8">
          The deck you&apos;re looking for doesn&apos;t exist or may have been removed.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
          <Link
            href="/compare"
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <Search className="w-4 h-4" />
            Compare Decks
          </Link>
        </div>
      </div>
    </div>
  );
}
