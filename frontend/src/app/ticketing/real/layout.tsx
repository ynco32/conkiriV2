import AuthGuard from '@/components/auth/AuthGuard/AuthGuard';

export default function RealTicketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <>{children}</>
    </AuthGuard>
  );
}
