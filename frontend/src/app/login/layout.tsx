import AuthGuard from '@/components/auth/AuthGuard/AuthGuard';

export default function loginLayout({
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
