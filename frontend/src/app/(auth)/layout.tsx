import AuthGuard from '@/components/auth/AuthGuard/AuthGuard';

export default function AuthLayout({
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
