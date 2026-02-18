import { db } from "@/lib/db"
import { CashSessionManager } from "@/components/admin/CashSessionManager"

export const dynamic = 'force-dynamic'

export default async function AdminCashPage() {
    const location = await db.location.findFirst() // Default location

    if (!location) return <div className="p-8 text-white">Location not configured.</div>

    // Get current open session
    const currentSession = await db.cashSession.findFirst({
        where: { locationId: location.id, endTime: null },
        include: { opener: true }
    })

    // Get history
    const history = await db.cashSession.findMany({
        where: { locationId: location.id, endTime: { not: null } },
        orderBy: { startTime: 'desc' },
        take: 10,
        include: { opener: true }
    })

    return (
        <div className="space-y-6">
            <header>
                <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Gestión de Efectivo</h2>
                <p className="text-slate-400">Control de caja y cierres diarios.</p>
            </header>

            <CashSessionManager
                currentSession={currentSession as any}
                history={history as any}
                locationId={location.id}
            />
        </div>
    )
}
