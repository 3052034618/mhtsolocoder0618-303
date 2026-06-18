import { useState, useMemo } from 'react'
import { Wrench, Clock, Loader2, CheckCircle2, ChevronDown, ChevronUp, Calendar, Upload, FileCheck, X } from 'lucide-react'
import { useAppStore } from '@/store'
import { StatusBadge, Badge } from '@/components/Badge'
import { cn } from '@/lib/utils'
import { format, differenceInDays, parseISO } from 'date-fns'

type RectStatus = 'pending' | 'planned' | 'rectifying' | 'completed'

const columns: { key: RectStatus[]; title: string; icon: React.ReactNode; color: string }[] = [
  { key: ['pending'], title: '待整改', icon: <Clock size={16} />, color: 'text-red-500' },
  { key: ['planned', 'rectifying'], title: '整改中', icon: <Loader2 size={16} />, color: 'text-amber-500' },
  { key: ['completed'], title: '已完成', icon: <CheckCircle2 size={16} />, color: 'text-emerald-500' },
]

export default function Rectifications() {
  const { rectifications, updateRectification } = useAppStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [modalType, setModalType] = useState<'plan' | 'photo' | null>(null)
  const [activeRectId, setActiveRectId] = useState<string | null>(null)
  const [planText, setPlanText] = useState('')
  const [planDeadline, setPlanDeadline] = useState('')

  const counts = useMemo(() => ({
    pending: rectifications.filter((r) => r.status === 'pending').length,
    rectifying: rectifications.filter((r) => r.status === 'planned' || r.status === 'rectifying').length,
    completed: rectifications.filter((r) => r.status === 'completed').length,
  }), [rectifications])

  const grouped = useMemo(() => ({
    pending: rectifications.filter((r) => r.status === 'pending'),
    rectifying: rectifications.filter((r) => r.status === 'planned' || r.status === 'rectifying'),
    completed: rectifications.filter((r) => r.status === 'completed'),
  }), [rectifications])

  function getCountdown(deadline: string) {
    const diff = differenceInDays(parseISO(deadline), new Date())
    if (diff < 0) return { text: `已逾期${Math.abs(diff)}天`, urgent: true }
    if (diff === 0) return { text: '今日截止', urgent: true }
    if (diff <= 3) return { text: `剩余${diff}天`, urgent: true }
    return { text: `剩余${diff}天`, urgent: false }
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

  function confirmClosure(rectId: string) {
    updateRectification(rectId, {
      status: 'completed',
      confirmedAt: format(new Date(), 'yyyy-MM-dd'),
      confirmedBy: '系统管理员',
    })
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  function renderCard(rect: typeof rectifications[0]) {
    const isExpanded = expandedId === rect.id
    const deadline = rect.deadline ? getCountdown(rect.deadline) : null
    const displayStatus = rect.status === 'planned' ? 'planned' : rect.status

    return (
      <div
        key={rect.id}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all"
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
              <span className={cn('text-xs font-medium', deadline.urgent ? 'text-red-500' : 'text-gray-400')}>
                {deadline.text}
              </span>
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
                <span className="text-xs text-gray-500">截止: {format(parseISO(rect.deadline), 'yyyy年M月d日')}</span>
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
                {rect.rectificationPhotos && rect.rectificationPhotos.length > 0 && (
                  <div className="flex gap-2">
                    {rect.rectificationPhotos.map((photo, idx) => (
                      <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden border border-gray-100">
                        <img src={photo} alt="整改照片" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); confirmClosure(rect.id) }}
                  className="w-full py-2 rounded-lg bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1"
                >
                  <FileCheck size={12} />
                  确认闭环
                </button>
              </div>
            )}

            {rect.status === 'completed' && (
              <div className="space-y-2">
                {rect.rectificationPhotos && rect.rectificationPhotos.length > 0 && (
                  <div className="flex gap-2">
                    {rect.rectificationPhotos.map((photo, idx) => (
                      <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden border border-gray-100">
                        <img src={photo} alt="整改照片" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-emerald-600">
                  <CheckCircle2 size={14} />
                  <span>已于 {rect.confirmedAt && format(parseISO(rect.confirmedAt), 'M月d日')} 由 {rect.confirmedBy} 确认闭环</span>
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
        <div className="w-10 h-10 rounded-xl bg-navy-900 flex items-center justify-center">
          <Wrench size={20} className="text-amber-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-navy-900">整改管理</h1>
          <p className="text-sm text-gray-500">共 {rectifications.length} 条整改项</p>
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
    </div>
  )
}
