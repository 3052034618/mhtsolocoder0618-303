import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Filter, Search, ChevronDown, Calendar, User, MapPin } from 'lucide-react'
import { useAppStore } from '@/store'
import { GradeBadge, ScoreBadge } from '@/components/Badge'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

export default function Reports() {
  const navigate = useNavigate()
  const { reports, stores, supervisors } = useAppStore()

  const [storeFilter, setStoreFilter] = useState('')
  const [supervisorFilter, setSupervisorFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      if (storeFilter && r.storeId !== storeFilter) return false
      if (supervisorFilter && r.supervisorName !== supervisorFilter) return false
      if (dateFrom && r.date < dateFrom) return false
      if (dateTo && r.date > dateTo) return false
      return true
    })
  }, [reports, storeFilter, supervisorFilter, dateFrom, dateTo])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-navy-900 flex items-center justify-center">
            <FileText size={20} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-navy-900">巡检报告</h1>
            <p className="text-sm text-gray-500">共 {filtered.length} 份报告</p>
          </div>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border',
            showFilters
              ? 'bg-navy-900 text-white border-navy-900'
              : 'bg-white text-navy-700 border-gray-200 hover:border-navy-300'
          )}
        >
          <Filter size={16} />
          筛选
          <ChevronDown
            size={14}
            className={cn('transition-transform', showFilters && 'rotate-180')}
          />
        </button>
      </div>

      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">门店</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={storeFilter}
                  onChange={(e) => setStoreFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-400 bg-white"
                >
                  <option value="">全部门店</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">督导</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={supervisorFilter}
                  onChange={(e) => setSupervisorFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-400 bg-white"
                >
                  <option value="">全部督导</option>
                  {supervisors.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">开始日期</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">结束日期</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => {
                setStoreFilter('')
                setSupervisorFilter('')
                setDateFrom('')
                setDateTo('')
              }}
              className="text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              重置筛选
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 flex flex-col items-center text-gray-400">
          <Search size={40} strokeWidth={1.5} />
          <p className="mt-3 text-sm">暂无匹配的巡检报告</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((report) => {
            const failedCount = report.items.filter((i) => !i.passed).length
            const pct = (report.totalScore / report.maxScore) * 100
            return (
              <div
                key={report.id}
                onClick={() => navigate(`/reports/${report.id}`)}
                className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:border-amber-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-navy-900 truncate group-hover:text-amber-700 transition-colors">
                      {report.storeName}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">{format(new Date(report.date), 'yyyy年M月d日')}</p>
                  </div>
                  <GradeBadge grade={report.grade} />
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <User size={12} />
                  <span>{report.supervisorName}</span>
                  {failedCount > 0 && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span className="text-red-500 font-medium">{failedCount}项不合格</span>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          pct >= 90 ? 'bg-emerald-500' : pct >= 75 ? 'bg-amber-500' : 'bg-red-500'
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <ScoreBadge score={report.totalScore} max={report.maxScore} />
                  </div>
                  <span className="text-xs text-gray-300 group-hover:text-amber-400 transition-colors">查看详情 →</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
