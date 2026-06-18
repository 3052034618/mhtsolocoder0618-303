import { useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Trophy, Target, AlertTriangle, Camera, Bell, BellOff, ChevronRight, Image,
  CheckCircle2, Clock, XCircle, ImagePlus, ArrowRight
} from 'lucide-react'
import { useAppStore } from '@/store'
import { GradeBadge, ScoreBadge, Badge } from '@/components/Badge'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import type { Rectification } from '@/types'

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { reports, rectifications } = useAppStore()

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

  const getItemRectification = (itemId: string): Rectification | undefined => {
    return rectifications.find(r => r.itemId === itemId && r.reportId === report?.id)
  }

  const rectificationSummary = useMemo(() => {
    if (!report) return { total: 0, pending: 0, inProgress: 0, completed: 0, completionRate: 0 }
    let pending = 0
    let inProgress = 0
    let completed = 0
    for (const item of failedItems) {
      const rect = rectifications.find(r => r.itemId === item.id && r.reportId === report?.id)
      if (!rect || rect.status === 'pending') {
        pending++
      } else if (rect.status === 'planned' || rect.status === 'rectifying') {
        inProgress++
      } else if (rect.status === 'completed') {
        completed++
      }
    }
    const total = failedItems.length
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    return { total, pending, inProgress, completed, completionRate }
  }, [failedItems, report, rectifications])

  const getStatusBadge = (status: Rectification['status']) => {
    const configs = {
      pending: { variant: 'danger' as const, label: '待整改', icon: XCircle },
      planned: { variant: 'warning' as const, label: '整改中', icon: Clock },
      rectifying: { variant: 'warning' as const, label: '整改中', icon: Clock },
      completed: { variant: 'success' as const, label: '已完成', icon: CheckCircle2 },
    }
    return configs[status] || configs.pending
  }

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
        <>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-navy-900 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-navy-600" />
                整改进度摘要
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-navy-900">{rectificationSummary.total}</div>
                <div className="text-xs text-gray-500 mt-1">不合格项总数</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <XCircle size={16} className="text-red-500" />
                  <span className="text-2xl font-bold text-red-600">{rectificationSummary.pending}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">待整改</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Clock size={16} className="text-amber-500" />
                  <span className="text-2xl font-bold text-amber-600">{rectificationSummary.inProgress}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">整改中</div>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span className="text-2xl font-bold text-emerald-600">{rectificationSummary.completed}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">已完成</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500">整体完成率</span>
                <span className="font-semibold text-navy-900">{rectificationSummary.completionRate}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${rectificationSummary.completionRate}%` }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-navy-900 flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500" />
                不合格项详情
              </h2>
              <Link
                to={`/rectifications?storeId=${report.storeId}`}
                className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 transition-colors"
              >
                去整改
                <ArrowRight size={12} />
              </Link>
            </div>
            {failedItems.map((item) => {
              const rect = getItemRectification(item.id)
              const statusConfig = rect ? getStatusBadge(rect.status) : getStatusBadge('pending')
              const StatusIcon = statusConfig.icon

              return (
                <div key={item.id} className="bg-white rounded-xl border border-red-100 p-4">
                  <div className="flex items-start gap-4 mb-4">
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
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-medium text-navy-900">{item.name}</span>
                        <Badge variant="default">{item.category}</Badge>
                        <Badge variant={statusConfig.variant} className="flex items-center gap-1">
                          <StatusIcon size={10} />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      {item.deductionReason && (
                        <p className="text-xs text-red-600 mb-2">{item.deductionReason}</p>
                      )}
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs text-gray-500">
                          得分: <span className="text-red-600 font-semibold">{item.score}</span>/{item.maxScore}
                        </span>
                        {item.photos && item.photos.length > 1 && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Image size={12} />
                            {item.photos.length}张照片
                          </span>
                        )}
                        {rect && rect.deadline && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={12} />
                            截止: {format(new Date(rect.deadline), 'yyyy-MM-dd')}
                          </span>
                        )}
                        {rect && rect.status === 'completed' && rect.confirmedAt && (
                          <span className="text-xs text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            完成于 {format(new Date(rect.confirmedAt), 'yyyy-MM-dd')}
                            {rect.confirmedBy && ` · ${rect.confirmedBy}确认`}
                          </span>
                        )}
                      </div>
                      {rect && (
                        <div className="mt-2">
                          <Link
                            to={`/rectifications?itemId=${item.id}&reportId=${report.id}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-navy-600 hover:text-navy-700"
                          >
                            查看整改进度
                            <ChevronRight size={12} />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center gap-1 mb-2">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <span className="text-xs font-medium text-red-600">问题照片</span>
                        </div>
                        {item.photos && item.photos.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {item.photos.map((photo, idx) => (
                              <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-gray-100">
                                <img
                                  src={photo}
                                  alt={`问题照片${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="aspect-video rounded-lg bg-gray-50 border border-gray-100 flex flex-col items-center justify-center">
                            <Camera size={24} className="text-gray-300 mb-1" />
                            <span className="text-xs text-gray-400">暂无照片</span>
                          </div>
                        )}
                      </div>

                      <div className="relative">
                        <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-sm">
                          <span className="text-xs font-bold text-gray-400">VS</span>
                        </div>
                        <div className="flex items-center gap-1 mb-2 ml-4">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-xs font-medium text-emerald-600">整改后照片</span>
                        </div>
                        {rect && rect.rectificationPhotos && rect.rectificationPhotos.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2 ml-4">
                            {rect.rectificationPhotos.map((photo, idx) => (
                              <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-gray-100">
                                <img
                                  src={photo}
                                  alt={`整改后照片${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="aspect-video rounded-lg bg-gray-50 border border-gray-100 flex flex-col items-center justify-center ml-4">
                          {rect && rect.status !== 'completed' ? (
                            <>
                              <ImagePlus size={24} className="text-amber-300 mb-1" />
                              <span className="text-xs text-amber-500">整改中...</span>
                            </>
                          ) : (
                            <>
                              <ImagePlus size={24} className="text-gray-300 mb-1" />
                              <span className="text-xs text-gray-400">暂无整改照片</span>
                            </>
                          )}
                        </div>
                        )}
                      </div>
                    </div>

                    {rect && rect.status === 'completed' && rect.confirmNote && (
                      <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-xs font-medium text-emerald-700">主管确认备注</div>
                            <p className="text-xs text-emerald-600 mt-1">{rect.confirmNote}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
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
