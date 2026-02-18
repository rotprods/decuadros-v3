import { db } from "@/lib/db"
import { POSInterface } from "@/components/admin/POSInterface"

export const dynamic = 'force-dynamic'

export default async function AdminPOSPage() {
    // Determine location (Default to first found for now)
    const location = await db.location.findFirst()

    if (!location) {
        return <div className="p-8 text-white">Location not configured. Run seed script.</div>
    }

    // Fetch active menu items
    const menuItems = await db.menuItem.findMany({
        where: { active: true },
        include: { category: true }
    })

    return (
        <div className="h-full">
            <POSInterface menuItems={menuItems} locationId={location.id} />
        </div>
    )
}
