"use client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type SalesData = {
    date: string
    sales: number
}

export function SalesChart({ data }: { data: SalesData[] }) {
    if (!data.length) {
        return (
            <div className="bg-slate-900 rounded-2xl border border-white/5 p-6 h-96 flex items-center justify-center text-slate-500">
                No hay datos de ventas recientes
            </div>
        )
    }

    return (
        <div className="bg-slate-900 rounded-2xl border border-white/5 p-6 h-96">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500">bar_chart</span>
                Ventas Semanales
            </h3>
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#94a3b8"
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            tickFormatter={(value) => `${value}€`}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                            itemStyle={{ color: '#fbbf24' }}
                            formatter={(value: number) => [`${value.toFixed(2)}€`, 'Ventas']}
                        />
                        <Bar
                            dataKey="sales"
                            fill="#f59e0b"
                            radius={[4, 4, 0, 0]}
                            barSize={40}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
