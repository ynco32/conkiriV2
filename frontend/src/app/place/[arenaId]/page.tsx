// src/app/place/[arenaId]/page.tsx
import PlaceTabs from '@/components/place/PlaceTabs/PlaceTabs';

export default async function PlacePage({ params }: any) {
  // params를 await
  const resolvedParams = await params;
  return <PlaceTabs arenaId={resolvedParams.arenaId} />;
}
