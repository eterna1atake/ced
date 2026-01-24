// กล่องแจ้งเตือนให้เพิ่มระบบยืนยันตัวตนก่อนอนุญาตให้แก้ไขสิทธิ์
import Link from 'next/link';

export default function RoleGuardHint() {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-medium">Role-based access</p>
      <p className="mt-1">
        Gate this section behind an authentication provider (such as NextAuth or Supabase) and use the
        helper utilities in <code className="rounded bg-amber-100 px-1 py-0.5">src/lib/auth</code> to ensure only
        administrators can change permissions.
      </p>
      <p className="mt-2">
        <Link href="https://next-auth.js.org/" className="font-medium underline">
          Read the NextAuth documentation
        </Link>{' '}
        to connect with your identity provider.
      </p>
    </div>
  );
}
