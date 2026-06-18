import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/store'
import { Badge, ScoreBadge } from '@/components/Badge'
import { cn } from '@/lib/utils'

const statusConfig = {
  normal: { variant: 'success' as const, label: '正常' },
  warning: { variant: 'warning' as const, label: '预警' },
  danger: { variant: 'danger' as const, label: '高危' },
}

function scoreBg(score: number) {
  if (score >= 90) return 'bg-emerald-50 text-emerald-700'
  if (score >= 75) return 'bg-amber-50 text-amber-700'
  return 'bg-red-50 text-red-700'
}

export default function Stores() {
  const navigate = useNavigate()
  const stores = useAppStore((s) => s.stores)
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('')

  const regions = useMemo(() => [...new Set(stores.map((s) => s.region))], [stores])

  const filtered = useMemo(() => {
    return stores.filter((s) => {
      const matchSearch = !search || s.name.includes(search) || s.manager.includes(search)
      const matchRegion = !region || s.region === region
      return matchSearch && matchRegion
    })
  }, [stores, search, region])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-serif text-navy-900">门店管理</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索门店名称或店长"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 w-64 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition"
            />
          </div>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition cursor-pointer"
            >
              <option value="">全部区域</option>
              {regions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-navy-50/60 border-b border-navy-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-navy-600 uppercase tracking-wider">门店名称</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-navy-600 uppercase tracking-wider">区域</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-navy-600 uppercase tracking-wider">店长</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-navy-600 uppercase tracking-wider">最近得分</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-navy-600 uppercase tracking-wider">平均分</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-navy-600 uppercase tracking-wider">状态</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-navy-600 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((store) => {
              const status = statusConfig[store.status]
              return (
                <tr
                  key={store.id}
                  onClick={() => navigate(`/stores/${store.id}`)}
                  className="border-b border-gray-50 hover:bg-amber-50/30 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-4">
                    <span className="text-sm font-medium text-navy-900">{store.name}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-gray-600">{store.region}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-gray-600">{store.manager}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-md text-sm font-semibold', scoreBg(store.lastScore))}>
                      {store.lastScore}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <ScoreBadge score={store.avgScore} />
                  </td>
                  <td className="px-5 py-4 text-center">
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/stores/${store.id}`) }}
                      className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 text-sm font-medium transition-colors"
                    >
                      查看详情
                      <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">
                  暂无匹配的门店数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>共 {filtered.length} 家门店</span>
        <span>其中 <span className="text-red-600 font-medium">{filtered.filter((s) => s.status === 'danger').length}</span> 家高危门店</span>
      </div>
    </div>
  )
}
