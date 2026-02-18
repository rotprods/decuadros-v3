import { db } from "@/lib/db"
import { UserTable } from "@/components/admin/UserTable"

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
    const users = await db.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100 // Limit for MVP
    })

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">CRM & Clientes</h2>
                    <p className="text-slate-400">Gestiona tu base de datos de aficionados.</p>
                </div>
                <div className="bg-slate-900 px-4 py-2 rounded-lg border border-white/10 text-xs font-mono text-slate-400">
                    {users.length} usuarios registrados
                </div>
            </header>

            <UserTable users={users} />
        </div>
    )
}
