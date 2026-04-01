import { Sidebar } from '@/components/organisms/sidebar/sidebar';
import { AuthGuard } from '@/lib/auth/auth-guard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="ml-16 flex-1 p-6 min-w-0">{children}</main>
      </div>
    </AuthGuard>
  );
}
