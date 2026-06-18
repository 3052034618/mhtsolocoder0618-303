import { useState, useMemo } from 'react'
import { useAppStore } from '@/store'
import { categoryIssueFrequency, regionRanking } from '@/data/mock'
import { Badge, ScoreBadge } from '@/components/Badge'
import { cn } from '@/lib/utils'
import {
  LineChart, BarChart, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid, Bar, Line, Cell,
} from 'recharts'
import {
  TrendingUp, TrendingDown, ClipboardCheck, AlertTriangle, CheckCircle2,
} from 'lucide-react'

const CHART_COLORS = ['#3A649E', '#E8913A', '#253D66', '#F0A854', '#7593C3']

export default function Dashboard() {
  const { stores, rectifications, plans } = useAppStore()
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>(
    stores.slice(0, 4).map((s) => s.id)
  )

  const avgScore = useMemo(() => {
    if (stores.length === 0) return 0
    return Math.round(stores.reduce((s, st) => s + st.lastScore, 0) / stores.length * 10) / 10
  }, [stores])

  const prevAvgScore = useMemo(() => {
    if (stores.length === 0) return 0
    return Math.round(stores.reduce((s, st) => {
      const hist = st.scoreHistory
      const prev = hist.length >= 2 ? hist[hist.length - 2].score : st.lastScore
      return s + prev
    }, 0) / stores.length * 10) / 10
  }, [stores])

  const scoreTrend = avgScore >= prevAvgScore

  const monthlyInspections = useMemo(() => {
    return plans.filter((p) => p.status === 'completed').length
  }, [plans])

  const pendingRectifications = useMemo(() => {
    return rectifications.filter((r) => r.status === 'pending' || r.status === 'planned' || r.status === 'rectifying').length
  }, [rectifications])

  const closureRate = useMemo(() => {
    if (rectifications.length === 0) return 0
    const completed = rectifications.filter((r) => r.status === 'completed').length
    return Math.round((completed / rectifications.length) * 1000) / 10
  }, [rectifications])

  const trendData = useMemo(() => {
    if (stores.length === 0 || selectedStoreIds.length === 0) return []
    const first = stores.find((s) => s.id === selectedStoreIds[0])
    if (!first) return []
    return first.scoreHistory.map((h) => {
      const entry: Record<string, string | number> = { date: h.date }
      for (const sid of selectedStoreIds) {
        const store = stores.find((s) => s.id === sid)
        if (store) {
          const point = store.scoreHistory.find((sh) => sh.date === h.date)
          entry[store.name] = point ? point.score : 0
        }
      }
      return entry
    })
  }, [stores, selectedStoreIds])

  const sortedRegionRanking = useMemo(() => {
    return [...regionRanking].sort((a, b) => b.avgScore - a.avgScore)
  }, [])

  const lowScoreStores = useMemo(() => {
    return stores.filter((s) => s.avgScore < 70 || s.status === 'danger')
  }, [stores])

  const toggleStore = (storeId: string) => {
    setSelectedStoreIds((prev) =>
      prev.includes(storeId) ? prev.filter((id) => id !== storeId) : [...prev, storeId]
    )
  }

  const getWarningLevel = (store: typeof stores[number]) => {
    if (store.avgScore < 60) return { label: '严重', variant: 'danger' as const }
    if (store.avgScore < 70) return { label: '警告', variant: 'warning' as const }
    return { label: '关注', variant: 'info' as const }
  }

  return (
    <div className="p-6 space-y-6 min-h-screen">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-navy-800">总部看板</h1>
          <p className="text-sm text-gray-500 mt-1">连锁门店品控巡检数据总览</p>
        </div>
        <p className="text-xs text-gray-400">数据更新于 2026-06-18</p>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between">
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
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-navy-800 font-serif">{avgScore}</span>
            <span className={cn('text-xs font-medium', scoreTrend ? 'text-emerald-500' : 'text-red-500')}>
              {scoreTrend ? '↑' : '↓'} {Math.abs(avgScore - prevAvgScore).toFixed(1)}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">较上期{scoreTrend ? '提升' : '下降'}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">本月巡检</span>
            <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center">
              <ClipboardCheck size={16} className="text-navy-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-navy-800 font-serif">{monthlyInspections}</span>
            <span className="text-sm text-gray-400">次</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">已完成巡检计划</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">待整改项</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <AlertTriangle size={16} className="text-amber-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-navy-800 font-serif">{pendingRectifications}</span>
            <span className="text-sm text-gray-400">项</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">待处理 / 整改中</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">整改闭合率</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={16} className="text-emerald-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-navy-800 font-serif">{closureRate}</span>
            <span className="text-lg text-gray-400">%</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">已完成 / 总整改项</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <h2 className="text-base font-serif font-semibold text-navy-800 mb-1">区域排名</h2>
          <p className="text-xs text-gray-400 mb-4">各区域平均得分对比</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={sortedRegionRanking} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
              <XAxis type="number" domain={[60, 100]} tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} />
              <YAxis type="category" dataKey="region" width={56} tick={{ fontSize: 13, fill: '#374151' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value: number) => [`${value} 分`, '平均分']}
                contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13 }}
              />
              <Bar dataKey="avgScore" radius={[0, 6, 6, 0]} barSize={24}>
                {sortedRegionRanking.map((entry, index) => (
                  <Cell
                    key={entry.region}
                    fill={index === 0 ? '#E8913A' : index === 1 ? '#3A649E' : '#7593C3'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            {sortedRegionRanking.map((r, i) => (
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
          <h2 className="text-base font-serif font-semibold text-navy-800 mb-1">问题类别频率</h2>
          <p className="text-xs text-gray-400 mb-4">各类别问题出现频次分布</p>
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
          {stores.map((store, idx) => (
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
                backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
                borderColor: CHART_COLORS[idx % CHART_COLORS.length],
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
              const store = stores.find((s) => s.id === sid)
              if (!store) return null
              return (
                <Line
                  key={sid}
                  type="monotone"
                  dataKey={store.name}
                  stroke={CHART_COLORS[stores.indexOf(store) % CHART_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 2 }}
                  activeDot={{ r: 5 }}
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
