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
  Calendar, MapPin, RefreshCcw, X, FileText, Wrench, AlertOctagon,
} from 'lucide-react'
import { format, differenceInDays, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'

const CHART_COLORS = ['#3A649E', '#E8913A', '#253D66', '#F0A854', '#7593C3']

const MONTH_OPTIONS = [
  '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06',
]

function getPreviousMonth(month: string): string {
  const [year, m] = month.split('-').map(Number)
  const date = new Date(year, m - 2, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export default function Dashboard() {
  const { stores, rectifications, plans, reports, templates, resetAll } = useAppStore()
  const navigate = useNavigate()
  const [selectedMonth, setSelectedMonth] = useState('2026-06')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([])
  const [drillDown, setDrillDown] = useState<{ type: 'region' | 'store' | null; value: string | null }>(null)

  const regionOptions = useMemo(() => {
    const regions = Array.from(new Set(stores.map((s) => s.region)))
    return regions
  }, [stores])

  const filteredStores = useMemo(() => {
    let result = stores
    if (selectedRegion !== 'all') {
      result = result.filter((s) => s.region === selectedRegion)
    }
    if (drillDown?.type === 'region') {
      result = result.filter((s) => s.region === drillDown.value)
    }
    if (drillDown?.type === 'store') {
      result = result.filter((s) => s.id === drillDown.value)
    }
    return result
  }, [stores, selectedRegion, drillDown])

  useEffect(() => {
    const defaultIds = filteredStores.slice(0, 4).map((s) => s.id)
    setSelectedStoreIds((prev) => {
      const hasAny = prev.some((id) => defaultIds.includes(id))
      return hasAny ? prev : defaultIds
    })
  }, [selectedRegion, drillDown])

  const monthReports = useMemo(() => {
    return reports.filter((r) => {
      if (!r.date.startsWith(selectedMonth)) return false
      if (selectedRegion !== 'all') {
        const store = stores.find((s) => s.id === r.storeId)
        if (!store || store.region !== selectedRegion) return false
      }
      if (drillDown?.type === 'region') {
        const store = stores.find((s) => s.id === r.storeId)
        if (!store || store.region !== drillDown.value) return false
      }
      if (drillDown?.type === 'store') {
        if (r.storeId !== drillDown.value) return false
      }
      return true
    })
  }, [reports, stores, selectedMonth, selectedRegion, drillDown])

  const prevMonth = getPreviousMonth(selectedMonth)
  const prevMonthReports = useMemo(() => {
    return reports.filter((r) => {
      if (!r.date.startsWith(prevMonth)) return false
      if (selectedRegion !== 'all') {
        const store = stores.find((s) => s.id === r.storeId)
        if (!store || store.region !== selectedRegion) return false
      }
      if (drillDown?.type === 'region') {
        const store = stores.find((s) => s.id === r.storeId)
        if (!store || store.region !== drillDown.value) return false
      }
      if (drillDown?.type === 'store') {
        if (r.storeId !== drillDown.value) return false
      }
      return true
    })
  }, [reports, stores, prevMonth, selectedRegion, drillDown])

  const monthPlans = useMemo(() => {
    return plans.filter((p) => {
      const date = p.completedDate || p.scheduledDate
      if (!date.startsWith(selectedMonth)) return false
      if (selectedRegion !== 'all') {
        const store = stores.find((s) => s.id === p.storeId)
        if (!store || store.region !== selectedRegion) return false
      }
      if (drillDown?.type === 'region') {
        const store = stores.find((s) => s.id === p.storeId)
        if (!store || store.region !== drillDown.value) return false
      }
      if (drillDown?.type === 'store') {
        if (p.storeId !== drillDown.value) return false
      }
      return true
    })
  }, [plans, stores, selectedMonth, selectedRegion, drillDown])

  const monthRectifications = useMemo(() => {
    return rectifications.filter((r) => {
      if (!r.deadline?.startsWith(selectedMonth)) return false
      if (selectedRegion !== 'all') {
        const store = stores.find((s) => s.id === r.storeId)
        if (!store || store.region !== selectedRegion) return false
      }
      if (drillDown?.type === 'region') {
        const store = stores.find((s) => s.id === r.storeId)
        if (!store || store.region !== drillDown.value) return false
      }
      if (drillDown?.type === 'store') {
        if (r.storeId !== drillDown.value) return false
      }
      return true
    })
  }, [rectifications, stores, selectedMonth, selectedRegion, drillDown])

  const avgScore = useMemo(() => {
    if (monthReports.length === 0) return 0
    const total = monthReports.reduce((s, r) => s + r.totalScore, 0)
    return Math.round((total / monthReports.length) * 10) / 10
  }, [monthReports])

  const storeAvgScore = useMemo(() => {
    return avgScore
  }, [avgScore])

  const prevAvgScore = useMemo(() => {
    if (prevMonthReports.length === 0) return 0
    const total = prevMonthReports.reduce((s, r) => s + r.totalScore, 0)
    return Math.round((total / prevMonthReports.length) * 10) / 10
  }, [prevMonthReports])

  const scoreTrend = avgScore >= prevAvgScore

  const monthlyInspections = useMemo(() => {
    return monthPlans.filter((p) => p.status === 'completed').length
  }, [monthPlans])

  const pendingRectifications = useMemo(() => {
    return monthRectifications.filter(
      (r) => r.status === 'pending' || r.status === 'planned' || r.status === 'rectifying'
    ).length
  }, [monthRectifications])

  const urgentRectifications = useMemo(() => {
    const today = new Date()
    return monthRectifications.filter((r) => {
      if (r.status === 'completed') return false
      if (!r.deadline) return false
      const deadline = parseISO(r.deadline)
      const daysUntil = differenceInDays(deadline, today)
      return daysUntil <= 3
    }).length
  }, [monthRectifications])

  const closureRate = useMemo(() => {
    if (monthRectifications.length === 0) return 0
    const completed = monthRectifications.filter((r) => r.status === 'completed').length
    return Math.round((completed / monthRectifications.length) * 1000) / 10
  }, [monthRectifications])

  const regionRanking = useMemo(() => {
    const groups: Record<string, { scores: number[]; count: number }> = {}
    monthReports.forEach((r) => {
      const store = stores.find((s) => s.id === r.storeId)
      if (!store) return
      const region = store.region
      if (!groups[region]) groups[region] = { scores: [], count: 0 }
      groups[region].scores.push(r.totalScore)
      groups[region].count += 1
    })
    return Object.entries(groups).map(([region, data]) => ({
      region,
      avgScore: Math.round((data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 10) / 10,
      storeCount: new Set(monthReports.filter((r) => {
        const s = stores.find((st) => st.id === r.storeId)
        return s?.region === region
      }).map((r) => r.storeId)).size,
    })).sort((a, b) => b.avgScore - a.avgScore)
  }, [monthReports, stores])

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
    const storeReports: Record<string, number[]> = {}
    monthReports.forEach((r) => {
      if (!storeReports[r.storeId]) storeReports[r.storeId] = []
      storeReports[r.storeId].push(r.totalScore)
    })
    return Object.entries(storeReports)
      .map(([storeId, scores]) => {
        const store = stores.find((s) => s.id === storeId)
        if (!store) return null
        const avg = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
        const hasLowScore = scores.some((s) => s < 70) || avg < 70
        if (!hasLowScore) return null
        return { ...store, monthAvgScore: avg, monthScores: scores }
      })
      .filter(Boolean) as (typeof stores[number] & { monthAvgScore: number; monthScores: number[] })[]
  }, [monthReports, stores])

  const toggleStore = (storeId: string) => {
    setSelectedStoreIds((prev) =>
      prev.includes(storeId)
        ? prev.filter((id) => id !== storeId)
        : [...prev, storeId]
    )
  }

  const getWarningLevel = (avgScore: number) => {
    if (avgScore < 60) return { label: '严重', variant: 'danger' as const }
    if (avgScore < 70) return { label: '警告', variant: 'warning' as const }
    return { label: '关注', variant: 'info' as const }
  }

  const handleBarClick = (data: any) => {
    if (data?.activePayload?.[0]?.payload?.region) {
      setDrillDown({ type: 'region', value: data.activePayload[0].payload.region })
    }
  }

  const handleStoreClick = (storeId: string) => {
    setDrillDown({ type: 'store', value: storeId })
  }

  const clearDrillDown = () => {
    setDrillDown(null)
  }

  const getDrillDownLabel = () => {
    if (!drillDown?.type || !drillDown?.value) return ''
    if (drillDown.type === 'region') return `区域: ${drillDown.value}`
    if (drillDown.type === 'store') {
      const store = stores.find((s) => s.id === drillDown.value)
      return `门店: ${store?.name || drillDown.value}`
    }
    return ''
  }

  const navigateToReports = () => {
    const params = new URLSearchParams()
    params.set('month', selectedMonth)
    if (selectedRegion !== 'all') params.set('region', selectedRegion)
    if (drillDown?.type === 'region') params.set('region', drillDown.value)
    if (drillDown?.type === 'store') params.set('storeId', drillDown.value)
    navigate(`/reports?${params.toString()}`)
  }

  const navigateToRectifications = () => {
    const params = new URLSearchParams()
    params.set('month', selectedMonth)
    if (selectedRegion !== 'all') params.set('region', selectedRegion)
    if (drillDown?.type === 'region') params.set('region', drillDown.value)
    if (drillDown?.type === 'store') params.set('storeId', drillDown.value)
    navigate(`/rectifications?${params.toString()}`)
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

      {drillDown && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-navy-50 border border-navy-200 rounded-full pl-4 pr-2 py-1.5">
            <AlertOctagon size={14} className="text-navy-600" />
            <span className="text-sm font-medium text-navy-700">{getDrillDownLabel()}</span>
            <button
              onClick={clearDrillDown}
              className="ml-1 w-6 h-6 rounded-full bg-navy-100 hover:bg-navy-200 flex items-center justify-center transition-colors"
            >
              <X size={14} className="text-navy-600" />
            </button>
          </div>
          <button
            onClick={navigateToReports}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-navy-600 text-white rounded-full text-sm font-medium hover:bg-navy-700 transition-colors shadow-sm"
          >
            <FileText size={14} />
            查看巡检明细
          </button>
          <button
            onClick={navigateToRectifications}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 text-white rounded-full text-sm font-medium hover:bg-amber-600 transition-colors shadow-sm"
          >
            <Wrench size={14} />
            查看整改明细
          </button>
        </div>
      )}

      <div className="grid grid-cols-4 gap-5">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-navy-500/5 rounded-full -mr-8 -mt-8" />
          <div className="flex items-center justify-between relative">
            <span className="text-sm text-gray-500">平均得分</span>
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
            <span className="text-sm text-gray-500">门店均分</span>
            <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center">
              <CheckCircle2 size={16} className="text-navy-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2 relative">
            <span className="text-3xl font-bold text-navy-800 font-serif">{storeAvgScore}</span>
            <span className="text-sm text-gray-400">分</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{monthLabel}报告平均分</p>
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
            <div className="flex items-center gap-1.5">
              {urgentRectifications > 0 && (
                <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                  {urgentRectifications}
                </span>
              )}
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <AlertTriangle size={16} className="text-amber-500" />
              </div>
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
              <p className="text-xs text-gray-400 mb-4">各区域平均得分对比（点击可下钻）</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={regionRanking}
              layout="vertical"
              margin={{ left: 10, right: 30, top: 5, bottom: 5 }}
              onClick={handleBarClick}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
              <XAxis type="number" domain={[60, 100]} tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} />
              <YAxis type="category" dataKey="region" width={56} tick={{ fontSize: 13, fill: '#374151', cursor: 'pointer' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value: number) => [`${value} 分`, '平均分']}
                contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13 }}
              />
              <Bar dataKey="avgScore" radius={[0, 6, 6, 0]} barSize={24} cursor="pointer">
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
              <div
                key={r.region}
                className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer hover:text-navy-700 transition-colors"
                onClick={() => setDrillDown({ type: 'region', value: r.region })}
              >
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
                  dot={{ r: 3, strokeWidth: 2, cursor: 'pointer' }}
                  activeDot={{ r: 5, cursor: 'pointer' }}
                  connectNulls
                  onClick={() => handleStoreClick(sid)}
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
            <p className="text-xs text-gray-400">本月报告得分低于70分的门店</p>
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
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">本月均分</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">得分评级</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">预警等级</th>
              </tr>
            </thead>
            <tbody>
              {lowScoreStores.map((store) => {
                const warning = getWarningLevel(store.monthAvgScore)
                const lastScore = store.monthScores[store.monthScores.length - 1]
                return (
                  <tr key={store.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td
                      className="py-3 px-4 font-medium text-navy-800 cursor-pointer hover:text-navy-600 hover:underline"
                      onClick={() => handleStoreClick(store.id)}
                    >
                      {store.name}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{store.region}</td>
                    <td className="py-3 px-4 text-center">
                      <ScoreBadge score={lastScore} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={cn(
                        'font-semibold',
                        store.monthAvgScore < 60 ? 'text-red-600' : store.monthAvgScore < 70 ? 'text-amber-600' : 'text-navy-600'
                      )}>
                        {store.monthAvgScore}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={cn(
                        'inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold',
                        lastScore >= 90 ? 'bg-emerald-50 text-emerald-700' :
                        lastScore >= 75 ? 'bg-blue-50 text-blue-700' :
                        lastScore >= 60 ? 'bg-amber-50 text-amber-700' :
                        'bg-red-50 text-red-700'
                      )}>
                        {lastScore >= 90 ? 'A' : lastScore >= 75 ? 'B' : lastScore >= 60 ? 'C' : 'D'}
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
