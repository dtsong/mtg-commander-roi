import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PRECON_DATABASE, getPreconById } from '@/lib/precons';
import DeckContent from './DeckContent';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return PRECON_DATABASE.map((deck) => ({
    id: deck.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const deck = getPreconById(id);

  if (!deck) {
    return {
      title: 'Deck Not Found - MTG Commander ROI',
    };
  }

  const title = `${deck.name} ROI Analysis - MTG Commander ROI`;
  const description = `Analyze the value of ${deck.name} from ${deck.set} (${deck.year}). Compare card prices against the $${deck.msrp.toFixed(2)} MSRP to calculate ROI.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://mtg-commander-roi.vercel.app/deck/${deck.id}`,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default async function DeckPage({ params }: PageProps) {
  const { id } = await params;
  const deck = getPreconById(id);

  if (!deck) {
    notFound();
  }

  return <DeckContent deckId={id} />;
}
