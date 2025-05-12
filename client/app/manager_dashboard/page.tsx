import Dashboard from "@/components_m2/dashboard"
import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <Dashboard />
      <Link href="/components_m2/pages/staff" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded">Manage Staff</Link>
    </div>
  )
}
