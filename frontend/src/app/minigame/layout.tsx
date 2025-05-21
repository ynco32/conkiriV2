// minigame/layout.tsx
'use client';
import React from 'react';
import { TicketingProvider } from './TicketingContext';

export default function MinigameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TicketingProvider>{children}</TicketingProvider>;
}
