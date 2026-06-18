import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Trophy, Target, AlertTriangle, Camera, Bell, BellOff, ChevronRight, Image,
} from 'lucide-react'
import { useAppStore } from '@/store'
import { GradeBadge, ScoreBadge, Badge } from '@/components/Badge'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { reports } = useAppStore()

  const report = useMemo(() => reports.find((r) => r.id === id), [reports, id])

  const categoryBreakdown = useMemo(() => {
    if (!report) return []
    const map = new Map<string, { category: string; items: typeof report.items; subtotal: number; maxSubtotal: number }>()
    for (const item of report.items) {
      const existing = map.get(item.category)
      if (existing) {
        existing.items.push(item)
        existing.subtotal += item.score
        existing.maxSubtotal += item.maxScore
      } else {
        map.set(item.category, { category: item.category, items: [item], subtotal: item.score, maxSubtotal: item.maxScore })
      }
    }
    return Array.from(map.values())
  }, [report])

  const failedItems = useMemo(() => {
    if (!report) return []
    return report.items.filter((i) => !i.passed)
  }, [report])

  if (!report) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-[60vh] text-gray-400">
        <AlertTriangle size={40} strokeWidth={1.5} />
        <p className="mt-3 text-sm">未找到该报告</p>
        <button onClick={() => navigate('/reports')} className="mt-4 text-sm text-amber-600 hover:text-amber-700 font-medium">
          返回列表
        </button>
      </div>
    )
  }

  const pct = (report.totalScore / report.maxScore) * 100

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/reports')}
          className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-navy-900">{report.storeName}</h1>
          <p className="text-sm text-gray-500">{format(new Date(report.date), 'yyyy年M月d日')} · {report.supervisorName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-navy-900 flex items-center justify-center mb-3">
            <Trophy size={28} className="text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-navy-900">{report.totalScore}</div>
          <div className="text-xs text-gray-400 mt-1">满分 {report.maxScore}</div>
          <div className="mt-2">
            <GradeBadge grade={report.grade} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-3">
            <Target size={28} className="text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-navy-900">{pct.toFixed(0)}%</div>
          <div className="text-xs text-gray-400 mt-1">得分率</div>
          <div className="mt-2">
            <ScoreBadge score={report.totalScore} max={report.maxScore} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-3">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
          <div className="text-3xl font-bold text-navy-900">{failedItems.length}</div>
          <div className="text-xs text-gray-400 mt-1">不合格项</div>
          <div className="mt-2">
            <Badge variant={failedItems.length > 0 ? 'danger' : 'success'}>
              {failedItems.length > 0 ? '需整改' : '全部合格'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-navy-900 mb-4">分类得分</h2>
        <div className="space-y-4">
          {categoryBreakdown.map((cat) => {
            const catPct = (cat.subtotal / cat.maxSubtotal) * 100
            const failedInCat = cat.items.filter((i) => !i.passed)
            return (
              <div key={cat.category} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-navy-800">{cat.category}</span>
                    {failedInCat.length > 0 && (
                      <span className="text-xs text-red-500">({failedInCat.length}项不合格)</span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-navy-900">
                    {cat.subtotal}<span className="text-gray-400 font-normal">/{cat.maxSubtotal}</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      catPct >= 90 ? 'bg-emerald-500' : catPct >= 75 ? 'bg-amber-500' : 'bg-red-500'
                    )}
                    style={{ width: `${catPct}%` }}
                  />
                </div>
                <div className="mt-2 pl-4 space-y-1.5">
                  {cat.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <ChevronRight size={10} className="text-gray-300" />
                        <span className={cn(item.passed ? 'text-gray-600' : 'text-red-600 font-medium')}>
                          {item.name}
                        </span>
                      </div>
                      <span className={cn(item.passed ? 'text-gray-500' : 'text-red-600 font-medium')}>
                        {item.score}/{item.maxScore}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {failedItems.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-navy-900 flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" />
            不合格项详情
          </h2>
          {failedItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-red-100 p-4">
              <div className="flex items-start gap-4">
                {item.photos && item.photos.length > 0 ? (
                  <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-gray-100">
                    <img
                      src={item.photos[0]}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
                    <Camera size={20} className="text-gray-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-navy-900">{item.name}</span>
                    <Badge variant="default">{item.category}</Badge>
                  </div>
                  {item.deductionReason && (
                    <p className="text-xs text-red-600 mb-2">{item.deductionReason}</p>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">
                      得分: <span className="text-red-600 font-semibold">{item.score}</span>/{item.maxScore}
                    </span>
                    {item.photos && item.photos.length > 1 && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Image size={12} />
                        {item.photos.length}张照片
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-navy-400" />
            <span className="text-sm text-gray-600">整改通知推送</span>
          </div>
          <div className="flex items-center gap-2">
            {failedItems.length > 0 ? (
              <>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-emerald-600 font-medium">已推送至门店</span>
              </>
            ) : (
              <>
                <BellOff size={14} className="text-gray-400" />
                <span className="text-xs text-gray-400">无需整改</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
