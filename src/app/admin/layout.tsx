import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

import { getCurrentRole, ROLES } from "@/lib/rbac"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const role = await getCurrentRole()

    // Allow access to any staff role
    const allowedRoles = [ROLES.OWNER, ROLES.MANAGER, ROLES.CASHIER, ROLES.KITCHEN, ROLES.STAFF, ROLES.ACCOUNTANT]
    const hasAccess = allowedRoles.includes(role)

    // If not authorized, redirect to App
    if (!hasAccess) {
        redirect("/app")
    }

    return (
        <div className="flex min-h-screen bg-slate-950 text-white font-sans">
            <AdminSidebar />
            <main className="flex-1 ml-64 p-8 overflow-y-auto min-h-screen">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
