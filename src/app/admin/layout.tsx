import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth()

    // Strict Role Check
    // Allow 'ADMIN' role OR specific email for dev/safety
    const role = (session?.user as any)?.role
    const email = session?.user?.email
    const isAdmin = role === 'ADMIN' || email === 'roiertoortega@gmail.com' || email === 'admin@decuadros.com'

    // If not authenticated or not admin, redirect to App
    if (!session || !isAdmin) {
        // In a real app, maybe redirect to 404 to hide admin existence, but redirect to /app is fine for now
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
