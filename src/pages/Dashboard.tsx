import { useState, useMemo, useEffect } from 'react'
import { useAppStore } from '@/store'
import { Badge, ScoreBadge } from '@/components/Badge'
import { cn } from '@/lib/utils'
import {
  LineChart, BarChart, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid, Bar, Line, Cell,
} from 'recharts'
import {
  TrendingUp, TrendingDown, ClipboardCheck, AlertTriangle, CheckCircle2,
  Calendar, MapPin, RefreshCcw,
} from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const CHART_COLORS = ['#3A649E', '#E8913A', '#253D66', '#F0A854', '#7593C3']

const MONTH_OPTIONS = [
  '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06',
]

export default function Dashboard() {
  const { stores, rectifications, plans, reports, templates, resetAll } = useAppStore()
  const [selectedMonth, setSelectedMonth] = useState('2026-06')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([])

  const regionOptions = useMemo(() => {
    const regions = Array.from(new Set(stores.map((s) => s.region)))
    return regions
  }, [stores])

  const filteredStores = useMemo(() => {
    return selectedRegion === 'all'
      ? stores
      : stores.filter((s) => s.region === selectedRegion)
  }, [stores, selectedRegion])

  useEffect(() => {
    const defaultIds = filteredStores.slice(0, 4).map((s) => s.id)
    setSelectedStoreIds((prev) => {
      const hasAny = prev.some((id) => defaultIds.includes(id))
      return hasAny ? prev : defaultIds
    })
  }, [selectedRegion])

  const monthReports = useMemo(() => {
    return reports.filter((r) => {
      if (!r.date.startsWith(selectedMonth)) return false
      if (selectedRegion !== 'all') {
        const store = stores.find((s) => s.id === r.storeId)
        if (!store || store.region !== selectedRegion) return false
      }
      return true
    })
  }, [reports, stores, selectedMonth, selectedRegion])

  const monthPlans = useMemo(() => {
    return plans.filter((p) => {
      const date = p.completedDate || p.scheduledDate
      if (!date.startsWith(selectedMonth)) return false
      if (selectedRegion !== 'all') {
        const store = stores.find((s) => s.id === p.storeId)
        if (!store || store.region !== selectedRegion) return false
      }
      return true
    })
  }, [plans, stores, selectedMonth, selectedRegion])

  const monthRectifications = useMemo(() => {
    return rectifications.filter((r) => {
      if (selectedRegion !== 'all') {
        const store = stores.find((s) => s.id === r.storeId)
        if (!store || store.region !== selectedRegion) return false
      }
      return true
    })
  }, [rectifications, stores, selectedRegion])

  const avgScore = useMemo(() => {
    if (filteredStores.length === 0) return 0
    return Math.round(
      filteredStores.reduce((s, st) => s + st.lastScore, 0) / filteredStores.length * 10
    ) / 10
  }, [filteredStores])

  const prevAvgScore = useMemo(() => {
    if (filteredStores.length === 0) return 0
    return Math.round(
      filteredStores.reduce((s, st) => {
        const hist = st.scoreHistory
        const idx = hist.findIndex((h) => h.date === selectedMonth)
        if (idx > 0) return s + hist[idx - 1].score
        if (hist.length >= 2) return s + hist[hist.length - 2].score
        return s + st.lastScore
      }, 0) / filteredStores.length * 10
    ) / 10
  }, [filteredStores, selectedMonth])

  const scoreTrend = avgScore >= prevAvgScore

  const monthlyInspections = useMemo(() => {
    return monthPlans.filter((p) => p.status === 'completed').length
  }, [monthPlans])

  const pendingRectifications = useMemo(() => {
    return monthRectifications.filter(
      (r) => r.status === 'pending' || r.status === 'planned' || r.status === 'rectifying'
    ).length
  }, [monthRectifications])

  const closureRate = useMemo(() => {
    if (monthRectifications.length === 0) return 0
    const completed = monthRectifications.filter((r) => r.status === 'completed').length
    return Math.round((completed / monthRectifications.length) * 1000) / 10
  }, [monthRectifications])

  const regionRanking = useMemo(() => {
    const groups: Record<string, { scores: number[]; count: number }> = {}
    filteredStores.forEach((s) => {
      if (!groups[s.region]) groups[s.region] = { scores: [], count: 0 }
      groups[s.region].scores.push(s.avgScore)
      groups[s.region].count += 1
    })
    return Object.entries(groups).map(([region, data]) => ({
      region,
      avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length * 10) / 10,
      storeCount: data.count,
    })).sort((a, b) => b.avgScore - a.avgScore)
  }, [filteredStores])

  const categoryIssueFrequency = useMemo(() => {
    const counter: Record<string, number> = {}
    monthReports.forEach((r) => {
      r.items.forEach((item) => {
        if (!item.passed) {
          counter[item.category] = (counter[item.category] || 0) + 1
        }
      })
    })
    const entries = Object.entries(counter).map(([category, count]) => ({
      category,
      count,
      percentage: 0,
    }))
    const total = entries.reduce((s, e) => s + e.count, 0)
    return entries.map((e) => ({
      ...e,
      percentage: total > 0 ? Math.round((e.count / total) * 1000) / 10 : 0,
    })).sort((a, b) => b.count - a.count)
  }, [monthReports])

  const trendData = useMemo(() => {
    if (filteredStores.length === 0 || selectedStoreIds.length === 0) return []
    const allDates = new Set<string>()
    selectedStoreIds.forEach((sid) => {
      const store = filteredStores.find((s) => s.id === sid)
      if (store) {
        store.scoreHistory.forEach((h) => allDates.add(h.date))
      }
    })
    const sortedDates = Array.from(allDates).sort()
    return sortedDates.map((date) => {
      const entry: Record<string, string | number> = { date }
      for (const sid of selectedStoreIds) {
        const store = filteredStores.find((s) => s.id === sid)
        if (store) {
          const point = store.scoreHistory.find((sh) => sh.date === date)
          entry[store.name] = point ? point.score : null
        }
      }
      return entry
    })
  }, [filteredStores, selectedStoreIds])

  const lowScoreStores = useMemo(() => {
    return filteredStores.filter((s) => s.avgScore < 70 || s.status === 'danger')
  }, [filteredStores])

  const toggleStore = (storeId: string) => {
    setSelectedStoreIds((prev) =>
      prev.includes(storeId)
        ? prev.filter((id) => id !== storeId)
        : [...prev, storeId]
    )
  }

  const getWarningLevel = (store: typeof stores[number]) => {
    if (store.avgScore < 60) return { label: '严重', variant: 'danger' as const }
    if (store.avgScore < 70) return { label: '警告', variant: 'warning' as const }
    return { label: '关注', variant: 'info' as const }
  }

  const monthLabel = format(new Date(selectedMonth + '-01'), 'yyyy年M月', { locale: zhCN })

  return (
    <div className="p-6 space-y-6 min-h-screen">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-navy-800">总部看板</h1>
          <p className="text-sm text-gray-500 mt-1">连锁门店品控巡检数据总览</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-sm border border-gray-100">
            <Calendar size={16} className="text-navy-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-sm text-navy-700 font-medium border-0 focus:ring-0 cursor-pointer"
            >
              {MONTH_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {format(new Date(m + '-01'), 'yyyy年M月', { locale: zhCN })}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-sm border border-gray-100">
            <MapPin size={16} className="text-navy-400" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-transparent text-sm text-navy-700 font-medium border-0 focus:ring-0 cursor-pointer"
            >
              <option value="all">全部区域</option>
              {regionOptions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              if (confirm('确定要重置所有数据到初始状态吗？')) {
                resetAll()
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-500 rounded-xl text-xs hover:bg-gray-200 hover:text-gray-700 transition-colors"
          >
            <RefreshCcw size={14} />
            重置数据
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-navy-500/5 rounded-full -mr-8 -mt-8" />
          <div className="flex items-center justify-between relative">
            <span className="text-sm text-gray-500">门店均分</span>
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              scoreTrend ? 'bg-emerald-50' : 'bg-red-50'
            )}>
              {scoreTrend
                ? <TrendingUp size={16} className="text-emerald-500" />
                : <TrendingDown size={16} className="text-red-500" />
              }
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2 relative">
            <span className="text-3xl font-bold text-navy-800 font-serif">{avgScore}</span>
            <span className={cn('text-xs font-medium', scoreTrend ? 'text-emerald-500' : 'text-red-500')}>
              {scoreTrend ? '↑' : '↓'} {Math.abs(avgScore - prevAvgScore).toFixed(1)}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">较上期{scoreTrend ? '提升' : '下降'}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-navy-500/5 rounded-full -mr-8 -mt-8" />
          <div className="flex items-center justify-between relative">
            <span className="text-sm text-gray-500">本月巡检</span>
            <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center">
              <ClipboardCheck size={16} className="text-navy-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2 relative">
            <span className="text-3xl font-bold text-navy-800 font-serif">{monthlyInspections}</span>
            <span className="text-sm text-gray-400">次</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{monthLabel}已完成巡检</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-8 -mt-8" />
          <div className="flex items-center justify-between relative">
            <span className="text-sm text-gray-500">待整改项</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <AlertTriangle size={16} className="text-amber-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2 relative">
            <span className="text-3xl font-bold text-navy-800 font-serif">{pendingRectifications}</span>
            <span className="text-sm text-gray-400">项</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">待处理 / 整改中</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-8 -mt-8" />
          <div className="flex items-center justify-between relative">
            <span className="text-sm text-gray-500">整改闭合率</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={16} className="text-emerald-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2 relative">
            <span className="text-3xl font-bold text-navy-800 font-serif">{closureRate}</span>
            <span className="text-lg text-gray-400">%</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">已完成 / 总整改项</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-base font-serif font-semibold text-navy-800">区域排名</h2>
              <p className="text-xs text-gray-400 mb-4">各区域平均得分对比</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={regionRanking} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
              <XAxis type="number" domain={[60, 100]} tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} />
              <YAxis type="category" dataKey="region" width={56} tick={{ fontSize: 13, fill: '#374151' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value: number) => [`${value} 分`, '平均分']}
                contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13 }}
              />
              <Bar dataKey="avgScore" radius={[0, 6, 6, 0]} barSize={24}>
                {regionRanking.map((entry, index) => (
                  <Cell
                    key={entry.region}
                    fill={index === 0 ? '#E8913A' : index === 1 ? '#3A649E' : '#7593C3'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 flex-wrap">
            {regionRanking.map((r, i) => (
              <div key={r.region} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className={cn(
                  'w-2.5 h-2.5 rounded-sm',
                  i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-navy-500' : 'bg-navy-300'
                )} />
                {r.region} {r.avgScore}分
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-base font-serif font-semibold text-navy-800">问题类别频率</h2>
              <p className="text-xs text-gray-400 mb-4">{monthLabel}各类别问题出现频次</p>
            </div>
            <Badge variant="warning">共 {categoryIssueFrequency.reduce((s, e) => s + e.count, 0)} 项</Badge>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryIssueFrequency} margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="category" tick={{ fontSize: 12, fill: '#374151' }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === 'count') return [`${value} 次`, '出现频次']
                  return [`${value}%`, '占比']
                }}
                contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13 }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={36}>
                {categoryIssueFrequency.map((_, index) => (
                  <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="text-base font-serif font-semibold text-navy-800">门店得分趋势</h2>
            <p className="text-xs text-gray-400">历史巡检评分走势对比</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4 mt-3">
          {filteredStores.map((store, idx) => (
            <button
              key={store.id}
              onClick={() => toggleStore(store.id)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-all border',
                selectedStoreIds.includes(store.id)
                  ? 'text-white border-transparent shadow-sm'
                  : 'text-gray-500 bg-white border-gray-200 hover:border-gray-300'
              )}
              style={selectedStoreIds.includes(store.id) ? {
                backgroundColor: CHART_COLORS[stores.indexOf(store) % CHART_COLORS.length],
                borderColor: CHART_COLORS[stores.indexOf(store) % CHART_COLORS.length],
              } : undefined}
            >
              {store.name.replace('味府·', '')}
            </button>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData} margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
            <YAxis domain={[40, 100]} tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13 }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            {selectedStoreIds.map((sid, idx) => {
              const store = filteredStores.find((s) => s.id === sid)
              if (!store) return null
              const colorIdx = stores.indexOf(stores.find((s) => s.id === sid)!)
              return (
                <Line
                  key={sid}
                  type="monotone"
                  dataKey={store.name}
                  stroke={CHART_COLORS[colorIdx % CHART_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 2 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              )
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-serif font-semibold text-navy-800">低分门店预警</h2>
            <p className="text-xs text-gray-400">均分低于70分或状态异常的门店</p>
          </div>
          <Badge variant="danger">{lowScoreStores.length} 家预警</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">门店名称</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">区域</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">最近得分</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">平均得分</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">得分评级</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">预警等级</th>
              </tr>
            </thead>
            <tbody>
              {lowScoreStores.map((store) => {
                const warning = getWarningLevel(store)
                return (
                  <tr key={store.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-navy-800">{store.name}</td>
                    <td className="py-3 px-4 text-gray-600">{store.region}</td>
                    <td className="py-3 px-4 text-center">
                      <ScoreBadge score={store.lastScore} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={cn(
                        'font-semibold',
                        store.avgScore < 60 ? 'text-red-600' : store.avgScore < 70 ? 'text-amber-600' : 'text-navy-600'
                      )}>
                        {store.avgScore}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={cn(
                        'inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold',
                        store.lastScore >= 90 ? 'bg-emerald-50 text-emerald-700' :
                        store.lastScore >= 75 ? 'bg-blue-50 text-blue-700' :
                        store.lastScore >= 60 ? 'bg-amber-50 text-amber-700' :
                        'bg-red-50 text-red-700'
                      )}>
                        {store.lastScore >= 90 ? 'A' : store.lastScore >= 75 ? 'B' : store.lastScore >= 60 ? 'C' : 'D'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={warning.variant}>{warning.label}</Badge>
                    </td>
                  </tr>
                )
              })}
              {lowScoreStores.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">暂无低分门店预警</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
