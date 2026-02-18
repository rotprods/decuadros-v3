
export function StatsCard({ title, value, icon, trend, trendUp = true }: { title: string, value: string, icon: string, trend?: string, trendUp?: boolean }) {
    return (
        <div className="bg-slate-900 p-6 rounded-2xl border border-white/5 hover:border-amber-500/50 transition-all group hover:shadow-lg hover:shadow-amber-500/5">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-800 rounded-xl group-hover:bg-amber-500/20 group-hover:text-amber-500 text-slate-400 transition-colors">
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
                {trend && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {trend}
                    </span>
                )}
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
            <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
        </div>
    )
}
