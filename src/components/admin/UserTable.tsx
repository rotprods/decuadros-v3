"use client"

export function UserTable({ users }: { users: any[] }) {
    const downloadCSV = () => {
        const headers = ["ID", "Name", "Email", "Phone", "Role", "Points", "Tier", "Total Spent", "Orders"]
        const rows = users.map(u => [
            u.id,
            `"${u.name}"`,
            u.email,
            u.phone || "",
            u.role,
            u.points,
            u.tier,
            u.totalSpent,
            u.orderCount
        ])

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n")

        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `de_cuadros_users_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
                <h3 className="font-bold text-white">Base de Datos de Clientes</h3>
                <button
                    onClick={downloadCSV}
                    className="bg-green-600/20 text-green-400 border border-green-600/50 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-green-600/30 transition-colors text-sm font-bold"
                >
                    <span className="material-symbols-outlined text-lg">download</span>
                    Exportar CSV
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-950 uppercase font-bold text-xs">
                        <tr>
                            <th className="px-6 py-4">Usuario</th>
                            <th className="px-6 py-4">Rol</th>
                            <th className="px-6 py-4 text-center">Nivel</th>
                            <th className="px-6 py-4 text-center">Pedidos</th>
                            <th className="px-6 py-4 text-right">Gasto Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-lg shadow-inner">
                                            {user.avatar}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{user.name}</p>
                                            <p className="text-xs">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full border ${user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                            user.role === 'KITCHEN' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                'bg-slate-800 text-slate-400 border-transparent'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`font-bold ${user.tier === 'LEYENDA' ? 'text-amber-500' :
                                            user.tier === 'VETERANO' ? 'text-blue-400' : 'text-slate-500'
                                        }`}>{user.tier}</span>
                                    <div className="text-[10px] text-slate-600">{user.points} XP</div>
                                </td>
                                <td className="px-6 py-4 text-center font-mono">
                                    {user.orderCount}
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-white">
                                    {user.totalSpent.toFixed(2)}€
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
