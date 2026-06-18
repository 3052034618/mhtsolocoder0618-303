import { useState, useMemo, useEffect } from 'react'
import { Wrench, Clock, Loader2, CheckCircle2, ChevronDown, ChevronUp, Calendar, Upload, FileCheck, X, AlertOctagon, Filter, ChevronLeft, MessageSquare, ThumbsUp, ThumbsDown, AlertTriangle } from 'lucide-react'
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store'
import { StatusBadge, Badge } from '@/components/Badge'
import { cn } from '@/lib/utils'
import { format, differenceInDays, parseISO, isToday, isPast } from 'date-fns'
import { zhCN } from 'date-fns/locale'

type RectStatus = 'pending' | 'planned' | 'rectifying' | 'completed'
type ViewMode = 'all' | 'manager' | 'supervisor'
type QuickFilter = 'all' | 'overdue' | 'soon'

const categories = ['食材存储', '卫生状况', '出餐速度', '员工仪容', '服务规范']

const columns: { key: RectStatus[]; title: string; icon: React.ReactNode; color: string }[] = [
  { key: ['pending'], title: '待整改', icon: <Clock size={16} />, color: 'text-red-500' },
  { key: ['planned', 'rectifying'], title: '整改中', icon: <Loader2 size={16} />, color: 'text-amber-500' },
  { key: ['completed'], title: '已完成', icon: <CheckCircle2 size={16} />, color: 'text-emerald-500' },
]

export default function Rectifications() {
  const { rectifications, updateRectification, stores } = useAppStore()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [modalType, setModalType] = useState<'plan' | 'photo' | 'confirm' | null>(null)
  const [activeRectId, setActiveRectId] = useState<string | null>(null)
  const [planText, setPlanText] = useState('')
  const [planDeadline, setPlanDeadline] = useState('')
  const [confirmNote, setConfirmNote] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [urlStoreId, setUrlStoreId] = useState<string | null>(null)
  const [urlRegion, setUrlRegion] = useState<string | null>(null)

  const myStoreIds = useMemo(() => {
    return stores.slice(0, 4).map(s => s.id)
  }, [stores])

  useEffect(() => {
    const storeId = searchParams.get('storeId')
    const region = searchParams.get('region')
    if (storeId) setUrlStoreId(storeId)
    if (region) setUrlRegion(region)
  }, [searchParams])

  function getUrgencyInfo(deadline?: string) {
    if (!deadline) return { level: 'normal' as const, daysLeft: 999, isOverdue: false, isSoon: false, isToday: false }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const deadlineDate = parseISO(deadline)
    deadlineDate.setHours(0, 0, 0, 0)
    const diff = differenceInDays(deadlineDate, today)

    if (diff < 0) return { level: 'overdue' as const, daysLeft: diff, isOverdue: true, isSoon: false, isToday: false }
    if (diff === 0) return { level: 'today' as const, daysLeft: 0, isOverdue: false, isSoon: true, isToday: true }
    if (diff <= 3) return { level: 'soon' as const, daysLeft: diff, isOverdue: false, isSoon: true, isToday: false }
    return { level: 'normal' as const, daysLeft: diff, isOverdue: false, isSoon: false, isToday: false }
  }

  function sortByUrgency(a: any, b: any) {
    const urgencyA = getUrgencyInfo(a.deadline)
    const urgencyB = getUrgencyInfo(b.deadline)

    const priorityOrder = { overdue: 0, today: 1, soon: 2, normal: 3 }
    const priorityDiff = priorityOrder[urgencyA.level] - priorityOrder[urgencyB.level]
    if (priorityDiff !== 0) return priorityDiff

    if (a.deadline && b.deadline) {
      return a.deadline.localeCompare(b.deadline)
    }
    return 0
  }

  const filteredRectifications = useMemo(() => {
    let result = [...rectifications]

    if (urlStoreId) {
      result = result.filter(r => r.storeId === urlStoreId)
    }

    if (urlRegion) {
      const storeIdsInRegion = stores.filter(s => s.region === urlRegion).map(s => s.id)
      result = result.filter(r => storeIdsInRegion.includes(r.storeId))
    }

    if (viewMode === 'manager') {
      result = result.filter(r => myStoreIds.includes(r.storeId))
    } else if (viewMode === 'supervisor') {
      result = result.filter(r => r.status === 'rectifying' || myStoreIds.includes(r.storeId))
    }

    if (quickFilter === 'overdue') {
      result = result.filter(r => getUrgencyInfo(r.deadline).isOverdue)
    } else if (quickFilter === 'soon') {
      result = result.filter(r => getUrgencyInfo(r.deadline).isSoon && !getUrgencyInfo(r.deadline).isOverdue)
    }

    if (selectedCategories.length > 0) {
      result = result.filter(r => selectedCategories.includes(r.category))
    }

    return result
  }, [rectifications, viewMode, quickFilter, selectedCategories, urlStoreId, urlRegion, stores, myStoreIds])

  const urgencyStats = useMemo(() => {
    const all = filteredRectifications
    return {
      overdue: all.filter(r => getUrgencyInfo(r.deadline).isOverdue).length,
      today: all.filter(r => getUrgencyInfo(r.deadline).isToday).length,
      soon: all.filter(r => getUrgencyInfo(r.deadline).isSoon && !getUrgencyInfo(r.deadline).isOverdue && !getUrgencyInfo(r.deadline).isToday).length,
    }
  }, [filteredRectifications])

  const counts = useMemo(() => ({
    pending: filteredRectifications.filter((r) => r.status === 'pending').length,
    rectifying: filteredRectifications.filter((r) => r.status === 'planned' || r.status === 'rectifying').length,
    completed: filteredRectifications.filter((r) => r.status === 'completed').length,
  }), [filteredRectifications])

  const grouped = useMemo(() => ({
    pending: filteredRectifications.filter((r) => r.status === 'pending').sort(sortByUrgency),
    rectifying: filteredRectifications.filter((r) => r.status === 'planned' || r.status === 'rectifying').sort(sortByUrgency),
    completed: filteredRectifications.filter((r) => r.status === 'completed').sort(sortByUrgency),
  }), [filteredRectifications])

  function clearUrlFilters() {
    setUrlStoreId(null)
    setUrlRegion(null)
    searchParams.delete('storeId')
    searchParams.delete('region')
    setSearchParams(searchParams, { replace: true })
  }

  function toggleCategory(cat: string) {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  function openConfirmModal(rectId: string) {
    setActiveRectId(rectId)
    setConfirmNote('')
    setModalType('confirm')
  }

  function openPlanModal(rectId: string) {
    setActiveRectId(rectId)
    setPlanText('')
    setPlanDeadline('')
    setModalType('plan')
  }

  function openPhotoModal(rectId: string) {
    setActiveRectId(rectId)
    setModalType('photo')
  }

  function submitPlan() {
    if (!activeRectId || !planText.trim() || !planDeadline) return
    updateRectification(activeRectId, {
      status: 'planned',
      plan: planText.trim(),
      deadline: planDeadline,
    })
    setModalType(null)
    setActiveRectId(null)
  }

  function uploadPhoto() {
    if (!activeRectId) return
    updateRectification(activeRectId, {
      status: 'rectifying',
      rectificationPhotos: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=clean+and+organized+restaurant+kitchen+after+rectification&image_size=landscape_4_3'],
      submittedAt: format(new Date(), 'yyyy-MM-dd'),
    })
    setModalType(null)
    setActiveRectId(null)
  }

  function approveClosure() {
    if (!activeRectId) return
    updateRectification(activeRectId, {
      status: 'completed',
      confirmNote: confirmNote.trim(),
      confirmedAt: format(new Date(), 'yyyy-MM-dd'),
      confirmedBy: '督导员',
    })
    setModalType(null)
    setActiveRectId(null)
    setConfirmNote('')
  }

  function rejectClosure() {
    if (!activeRectId) return
    updateRectification(activeRectId, {
      status: 'planned',
      confirmNote: confirmNote.trim(),
      rectificationPhotos: undefined,
      submittedAt: undefined,
    })
    setModalType(null)
    setActiveRectId(null)
    setConfirmNote('')
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  function getCountdown(deadline: string) {
    const diff = differenceInDays(parseISO(deadline), new Date())
    if (diff < 0) return { text: `⚠️ 已逾期 ${Math.abs(diff)} 天`, urgent: true, overdue: true }
    if (diff === 0) return { text: '⏰ 今日截止', urgent: true, overdue: false }
    if (diff <= 3) return { text: `剩余${diff}天`, urgent: true, overdue: false }
    return { text: `剩余${diff}天`, urgent: false, overdue: false }
  }

  function renderCard(rect: typeof rectifications[0]) {
    const isExpanded = expandedId === rect.id
    const deadline = rect.deadline ? getCountdown(rect.deadline) : null
    const urgency = getUrgencyInfo(rect.deadline)
    const displayStatus = rect.status === 'planned' ? 'planned' : rect.status

    return (
      <div
        key={rect.id}
        className={cn(
          "bg-white rounded-lg border overflow-hidden transition-all",
          urgency.isOverdue
            ? "border-red-500 shadow-lg shadow-red-100 animate-pulse"
            : urgency.isSoon
            ? "border-amber-400"
            : "border-gray-200"
        )}
      >
        <div
          className="p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
          onClick={() => toggleExpand(rect.id)}
        >
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm font-medium text-navy-900 leading-tight">{rect.itemName}</h4>
            <StatusBadge status={displayStatus} />
          </div>
          <p className="text-xs text-gray-500 mb-2">{rect.storeName}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="default">{rect.category}</Badge>
            {deadline && (
              <span className={cn(
                'text-xs font-medium',
                deadline.overdue
                  ? 'text-red-600 font-semibold'
                  : deadline.urgent
                  ? 'text-amber-600'
                  : 'text-gray-400'
              )}>
                {deadline.text}
              </span>
            )}
            {urgency.isSoon && !urgency.isOverdue && (
              <AlertTriangle size={12} className="text-amber-500" />
            )}
          </div>
          <p className="text-xs text-red-600 mt-2 line-clamp-1">{rect.deductionReason}</p>
          <div className="flex items-center justify-end mt-2">
            {isExpanded ? (
              <ChevronUp size={14} className="text-gray-400" />
            ) : (
              <ChevronDown size={14} className="text-gray-400" />
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
            {rect.plan && (
              <div>
                <span className="text-xs text-gray-400">整改计划</span>
                <p className="text-xs text-navy-800 mt-0.5">{rect.plan}</p>
              </div>
            )}
            {rect.deadline && (
              <div className="flex items-center gap-2">
                <Calendar size={12} className="text-gray-400" />
                <span className="text-xs text-gray-500">截止: {format(parseISO(rect.deadline), 'yyyy年M月d日', { locale: zhCN })}</span>
              </div>
            )}

            {(rect.problemPhotos?.length || rect.rectificationPhotos?.length) && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {rect.problemPhotos && rect.problemPhotos.length > 0 && (
                    <div>
                      <span className="text-xs text-gray-400 block mb-1">问题照片</span>
                      <div className="flex gap-1 flex-wrap">
                        {rect.problemPhotos.map((photo, idx) => (
                          <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden border border-red-200">
                            <img src={photo} alt="问题照片" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {rect.rectificationPhotos && rect.rectificationPhotos.length > 0 && (
                    <div>
                      <span className="text-xs text-gray-400 block mb-1">整改后照片</span>
                      <div className="flex gap-1 flex-wrap">
                        {rect.rectificationPhotos.map((photo, idx) => (
                          <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden border border-emerald-200">
                            <img src={photo} alt="整改后照片" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {rect.status === 'pending' && (
              <button
                onClick={(e) => { e.stopPropagation(); openPlanModal(rect.id) }}
                className="w-full py-2 rounded-lg bg-amber-500 text-white text-xs font-medium hover:bg-amber-600 transition-colors"
              >
                填写整改计划
              </button>
            )}

            {rect.status === 'planned' && (
              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); openPhotoModal(rect.id) }}
                  className="flex-1 py-2 rounded-lg bg-amber-500 text-white text-xs font-medium hover:bg-amber-600 transition-colors flex items-center justify-center gap-1"
                >
                  <Upload size={12} />
                  上传整改照片
                </button>
              </div>
            )}

            {rect.status === 'rectifying' && (
              <div className="space-y-2">
                <button
                  onClick={(e) => { e.stopPropagation(); openConfirmModal(rect.id) }}
                  className="w-full py-2 rounded-lg bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1"
                >
                  <FileCheck size={12} />
                  确认闭环
                </button>
              </div>
            )}

            {rect.status === 'completed' && (
              <div className="space-y-2">
                {rect.confirmNote && (
                  <div className="bg-navy-50 rounded-lg p-2">
                    <div className="flex items-center gap-1 text-xs text-navy-600 mb-1">
                      <MessageSquare size={12} />
                      <span className="font-medium">确认备注</span>
                    </div>
                    <p className="text-xs text-navy-800">{rect.confirmNote}</p>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-emerald-600">
                  <CheckCircle2 size={14} />
                  <span>已于 {rect.confirmedAt && format(parseISO(rect.confirmedAt), 'M月d日', { locale: zhCN })} 由 {rect.confirmedBy} 确认闭环</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={20} className="text-navy-700" />
        </button>
        <div className="w-10 h-10 rounded-xl bg-navy-900 flex items-center justify-center">
          <Wrench size={20} className="text-amber-400" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-navy-900">整改管理</h1>
          <p className="text-sm text-gray-500">共 {filteredRectifications.length} 条整改项</p>
        </div>
        {urgencyStats.overdue > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
            <AlertOctagon size={16} className="text-red-500" />
            <span className="text-sm font-semibold text-red-600">逾期告警: {urgencyStats.overdue} 项</span>
          </div>
        )}
      </div>

      {(urlStoreId || urlRegion) && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">当前筛选:</span>
          {urlStoreId && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
              门店: {stores.find(s => s.id === urlStoreId)?.name || urlStoreId}
              <button onClick={() => { setUrlStoreId(null); searchParams.delete('storeId'); setSearchParams(searchParams, { replace: true }) }} className="ml-1 hover:text-amber-900">
                <X size={12} />
              </button>
            </span>
          )}
          {urlRegion && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-navy-100 text-navy-800 rounded-full text-xs font-medium">
              区域: {urlRegion}
              <button onClick={() => { setUrlRegion(null); searchParams.delete('region'); setSearchParams(searchParams, { replace: true }) }} className="ml-1 hover:text-navy-900">
                <X size={12} />
              </button>
            </span>
          )}
          <button onClick={clearUrlFilters} className="text-xs text-gray-500 hover:text-gray-700 underline">
            清除筛选
          </button>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
            <AlertOctagon size={20} className="text-red-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{urgencyStats.overdue}</div>
            <div className="text-xs text-gray-500">已逾期</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <Clock size={20} className="text-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600">{urgencyStats.today}</div>
            <div className="text-xs text-gray-500">今日到期</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
            <AlertTriangle size={20} className="text-orange-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{urgencyStats.soon}</div>
            <div className="text-xs text-gray-500">3天内到期</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 size={20} className="text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">{counts.completed}</div>
            <div className="text-xs text-gray-500">已完成</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
            <Clock size={20} className="text-red-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-navy-900">{counts.pending}</div>
            <div className="text-xs text-gray-500">待整改</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <Loader2 size={20} className="text-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-navy-900">{counts.rectifying}</div>
            <div className="text-xs text-gray-500">整改中</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 size={20} className="text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-navy-900">{counts.completed}</div>
            <div className="text-xs text-gray-500">已完成</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-navy-900">视角切换:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { key: 'all' as const, label: '全部视图' },
                { key: 'manager' as const, label: '店长视角' },
                { key: 'supervisor' as const, label: '督导视角' },
              ].map((view) => (
                <button
                  key={view.key}
                  onClick={() => setViewMode(view.key)}
                  className={cn(
                    'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
                    viewMode === view.key
                      ? 'bg-navy-900 text-white'
                      : 'text-gray-600 hover:text-navy-900'
                  )}
                >
                  {view.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-6 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <span className="text-sm font-medium text-navy-900">快速筛选:</span>
            <div className="flex gap-2">
              {[
                { key: 'all' as const, label: '全部' },
                { key: 'overdue' as const, label: '只看逾期' },
                { key: 'soon' as const, label: '只看3天内到期' },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setQuickFilter(filter.key)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium transition-colors border',
                    quickFilter === filter.key
                      ? filter.key === 'overdue'
                        ? 'bg-red-100 text-red-700 border-red-200'
                        : filter.key === 'soon'
                        ? 'bg-amber-100 text-amber-700 border-amber-200'
                        : 'bg-navy-100 text-navy-700 border-navy-200'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-navy-300'
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-navy-900">分类筛选:</span>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-colors border',
                  selectedCategories.includes(cat)
                    ? 'bg-navy-900 text-white border-navy-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-navy-300'
                )}
              >
                {cat}
              </button>
            ))}
            {selectedCategories.length > 0 && (
              <button
                onClick={() => setSelectedCategories([])}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                清除
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 flex-1 min-h-0 overflow-hidden">
        {columns.map((col) => {
          const items = col.key.includes('pending')
            ? grouped.pending
            : col.key.includes('rectifying')
            ? grouped.rectifying
            : grouped.completed
          return (
            <div key={col.title} className="bg-gray-100 rounded-xl p-4 flex flex-col overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <span className={col.color}>{col.icon}</span>
                <h3 className="text-sm font-semibold text-navy-900">{col.title}</h3>
                <span className="text-xs text-gray-400 ml-auto">{items.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {items.length === 0 ? (
                  <div className="text-center text-xs text-gray-400 py-8">暂无数据</div>
                ) : (
                  items.map(renderCard)
                )}
              </div>
            </div>
          )
        })}
      </div>

      {modalType === 'plan' && activeRectId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setModalType(null)}>
          <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-navy-900">填写整改计划</h3>
              <button onClick={() => setModalType(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">整改措施</label>
              <textarea
                value={planText}
                onChange={(e) => setPlanText(e.target.value)}
                rows={4}
                placeholder="请描述具体整改措施..."
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">整改截止日期</label>
              <input
                type="date"
                value={planDeadline}
                onChange={(e) => setPlanDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setModalType(null)}
                className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={submitPlan}
                disabled={!planText.trim() || !planDeadline}
                className={cn(
                  'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                  planText.trim() && planDeadline
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                )}
              >
                提交计划
              </button>
            </div>
          </div>
        </div>
      )}

      {modalType === 'photo' && activeRectId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setModalType(null)}>
          <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-navy-900">上传整改照片</h3>
              <button onClick={() => setModalType(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-lg py-10 flex flex-col items-center text-gray-400">
              <Upload size={32} strokeWidth={1.5} />
              <p className="text-sm mt-2">点击或拖拽上传整改照片</p>
              <p className="text-xs mt-1">支持 JPG、PNG 格式</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setModalType(null)}
                className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={uploadPhoto}
                className="flex-1 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
              >
                确认上传
              </button>
            </div>
          </div>
        </div>
      )}

      {modalType === 'confirm' && activeRectId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setModalType(null)}>
          <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-navy-900">确认整改完成</h3>
              <button onClick={() => setModalType(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-800">
                请仔细核查整改情况，填写确认备注后选择通过或驳回。
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">确认备注</label>
              <textarea
                value={confirmNote}
                onChange={(e) => setConfirmNote(e.target.value)}
                rows={4}
                placeholder="请输入确认备注，说明整改情况或驳回原因..."
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={rejectClosure}
                className="flex-1 py-2.5 rounded-lg border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <ThumbsDown size={14} />
                驳回
              </button>
              <button
                onClick={approveClosure}
                disabled={!confirmNote.trim()}
                className={cn(
                  'flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2',
                  confirmNote.trim()
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                )}
              >
                <ThumbsUp size={14} />
                通过
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
