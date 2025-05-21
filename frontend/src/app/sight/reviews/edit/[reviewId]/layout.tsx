import AuthGuard from '@/components/auth/AuthGuard/AuthGuard';

export default function ReviewEditLayout({
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
