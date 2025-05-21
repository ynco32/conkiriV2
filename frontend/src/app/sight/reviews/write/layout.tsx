import AuthGuard from '@/components/auth/AuthGuard/AuthGuard';

export default function ReviewWriteLayout({
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
