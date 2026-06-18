import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store'
import type { InspectionItem, Rectification } from '@/types'
import { CheckCircle, XCircle, Camera, ChevronDown, ChevronUp, Send, X, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { addDays, format } from 'date-fns'

interface ItemState {
  passed: boolean | null
  deductionReason: string
  photos: string[]
}

const presetReasons: Record<string, string[]> = {
  '食材存储': ['温度不达标', '食材过期', '存储不规范', '生熟混放'],
  '卫生状况': ['地面不洁', '餐具未消毒', '垃圾桶未盖', '有虫鼠痕迹'],
  '出餐速度': ['出餐超时', '外卖响应慢', '备料不足'],
  '员工仪容': ['着装不规范', '未戴发帽', '健康证过期'],
  '服务规范': ['服务话术不标准', '态度欠佳', '未主动问候'],
}

export default function InspectionExecute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    plans, templates, updatePlan, addReport,
    addRectifications, updateStoreScore
  } = useAppStore()

  const plan = id
    ? plans.find(p => p.id === id)
    : plans.find(p => p.status === 'in_progress')

  const template = plan
    ? templates.find(t => t.id === plan.templateId)
    : templates[0]

  const storeName = plan?.storeName ?? '演示门店'
  const templateName = template?.name ?? '通用巡检评分表'
  const categories = template?.categories ?? []

  const [itemStates, setItemStates] = useState<Record<string, ItemState>>(() => {
    const initial: Record<string, ItemState> = {}
    categories.forEach(cat => {
      cat.items.forEach(item => {
        initial[item.id] = { passed: null, deductionReason: '', photos: [] }
      })
    })
    return initial
  })

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    categories.forEach(cat => { initial[cat.id] = true })
    return initial
  })

  const [submitted, setSubmitted] = useState(false)
  const [generatedReportId, setGeneratedReportId] = useState<string | null>(null)

  useEffect(() => {
    if (plan && plan.status === 'planned') {
      updatePlan(plan.id, { status: 'in_progress' })
    }
  }, [plan?.id, plan?.status, updatePlan])

  const totalMaxScore = useMemo(() =>
    categories.reduce((sum, cat) => sum + cat.items.reduce((s, item) => s + item.maxScore, 0), 0),
    [categories]
  )

  const totalScore = useMemo(() =>
    categories.reduce((sum, cat) => sum + cat.items.reduce((s, item) => {
      const state = itemStates[item.id]
      return s + (state?.passed === true ? item.maxScore : 0)
    }, 0), 0),
    [categories, itemStates]
  )

  const isItemFailedIncomplete = (itemId: string): boolean => {
    const state = itemStates[itemId]
    if (!state || state.passed !== false) return false
    return !state.deductionReason.trim() || state.photos.length === 0
  }

  const isItemComplete = (itemId: string): boolean => {
    const state = itemStates[itemId]
    if (!state || state.passed === null) return false
    if (state.passed === true) return true
    return state.deductionReason.trim() !== '' && state.photos.length > 0
  }

  const checkedCount = Object.values(itemStates).filter(s => s.passed !== null).length
  const totalCount = Object.keys(itemStates).length
  const failedCount = Object.values(itemStates).filter(s => s.passed === false).length
  const failedCompleteCount = Object.keys(itemStates).filter(id =>
    itemStates[id].passed === false && !isItemFailedIncomplete(id)
  ).length
  const incompleteFailedCount = Object.keys(itemStates).filter(id => isItemFailedIncomplete(id)).length
  const allChecked = checkedCount === totalCount && totalCount > 0
  const allFailedComplete = incompleteFailedCount === 0
  const canSubmit = allChecked && allFailedComplete && !submitted
  const progress = totalMaxScore > 0 ? totalScore / totalMaxScore : 0
  const grade = progress >= 0.9 ? 'A' : progress >= 0.8 ? 'B' : progress >= 0.6 ? 'C' : 'D'

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }))
  }

  const setItemPassed = (itemId: string, passed: boolean) => {
    setItemStates(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        passed,
        ...(passed ? { deductionReason: '', photos: [] } : {}),
      }
    }))
  }

  const setItemDeduction = (itemId: string, reason: string) => {
    setItemStates(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], deductionReason: reason }
    }))
  }

  const simulatePhotoUpload = (itemId: string) => {
    const count = Math.floor(Math.random() * 3) + 1
    const newPhotos: string[] = []
    for (let i = 0; i < count; i++) {
      const timestamp = Date.now() + i
      const prompt = encodeURIComponent('restaurant kitchen inspection problem food safety hygiene violation')
      newPhotos.push(`https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${prompt}&image_size=square_hd&t=${timestamp}`)
    }
    setItemStates(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        photos: [...prev[itemId].photos, ...newPhotos]
      }
    }))
  }

  const removePhoto = (itemId: string, photoIndex: number) => {
    setItemStates(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        photos: prev[itemId].photos.filter((_, idx) => idx !== photoIndex)
      }
    }))
  }

  const applyPresetReason = (itemId: string, reason: string) => {
    setItemStates(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], deductionReason: reason }
    }))
  }

  const handleSubmit = () => {
    if (!canSubmit) return

    const today = new Date()
    const todayStr = format(today, 'yyyy-MM-dd')
    const deadlineDate = addDays(today, 7)
    const deadlineStr = format(deadlineDate, 'yyyy-MM-dd')

    const items: InspectionItem[] = categories.flatMap(cat =>
      cat.items.map(item => {
        const state = itemStates[item.id]
        return {
          id: item.id,
          category: cat.name,
          name: item.name,
          maxScore: item.maxScore,
          score: state.passed ? item.maxScore : 0,
          passed: state.passed as boolean,
          photos: state.photos.length > 0 ? state.photos : undefined,
          deductionReason: state.deductionReason || undefined,
        }
      })
    )

    const reportId = `r_${Date.now()}`

    if (plan) {
      updatePlan(plan.id, {
        status: 'completed',
        completedDate: todayStr
      })
    }

    addReport({
      id: reportId,
      planId: plan?.id ?? 'demo',
      storeId: plan?.storeId ?? 'demo',
      storeName,
      supervisorName: plan?.supervisorName ?? '演示督查',
      date: todayStr,
      totalScore,
      maxScore: totalMaxScore,
      grade,
      items,
    })

    const failedItems = items.filter(i => !i.passed)
    if (failedItems.length > 0 && plan) {
      const newRectifications: Rectification[] = failedItems.map((item, idx) => ({
        id: `rect_${Date.now()}_${idx}`,
        reportId,
        itemId: item.id,
        storeId: plan.storeId,
        storeName: plan.storeName,
        itemName: item.name,
        category: item.category,
        deductionReason: item.deductionReason || '巡检不合格',
        status: 'pending',
        deadline: deadlineStr,
        problemPhotos: item.photos,
      }))
      addRectifications(newRectifications)
    }

    if (plan) {
      updateStoreScore(plan.storeId, totalScore, todayStr)
    }

    setGeneratedReportId(reportId)
    setSubmitted(true)
  }

  if (!template) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">未找到评分模板</p>
      </div>
    )
  }

  const circumference = 2 * Math.PI * 24

  const getSubmitDisabledMessage = (): string => {
    if (submitted) return '已提交'
    if (!allChecked) return `还需检查 ${totalCount - checkedCount} 项`
    if (!allFailedComplete) return `${incompleteFailedCount} 个不合格项缺少原因或照片`
    return ''
  }

  return (
    <div className="pb-40">
      <div className="bg-navy-900 text-white px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold font-serif">巡检执行</h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-navy-200">
              <span>{storeName}</span>
              <span className="text-navy-600">|</span>
              <span>{templateName}</span>
            </div>
          </div>
          {plan?.type === 'surprise' && (
            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-md font-medium">
              突击检查
            </span>
          )}
        </div>
        <div className="mt-3 flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-navy-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            已检 {checkedCount}/{totalCount}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-navy-300">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            当前 {totalScore}/{totalMaxScore}
          </div>
          {failedCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-navy-300">
              <span className={cn(
                'w-2 h-2 rounded-full',
                allFailedComplete ? 'bg-emerald-400' : 'bg-amber-400'
              )} />
              不合格完整 {failedCompleteCount}/{failedCount}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {categories.map(category => {
          const isExpanded = expandedCategories[category.id]
          const catChecked = category.items.filter(i => itemStates[i.id]?.passed !== null).length
          const catTotal = category.items.length
          const catScore = category.items.reduce(
            (s, item) => s + (itemStates[item.id]?.passed === true ? item.maxScore : 0), 0
          )
          const catMaxScore = category.items.reduce((s, item) => s + item.maxScore, 0)
          const catIncomplete = category.items.filter(i => isItemFailedIncomplete(i.id)).length

          return (
            <div key={category.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-navy-800 text-white hover:bg-navy-700/90 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-sm">{category.name}</span>
                  <span className={cn(
                    'text-xs px-1.5 py-0.5 rounded',
                    catChecked === catTotal
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-navy-600 text-navy-300'
                  )}>
                    {catChecked}/{catTotal} 已检
                  </span>
                  {catIncomplete > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                      {catIncomplete} 待完善
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-amber-400 font-medium">
                    {catScore}/{catMaxScore}
                  </span>
                  {isExpanded
                    ? <ChevronUp size={16} className="text-navy-400" />
                    : <ChevronDown size={16} className="text-navy-400" />
                  }
                </div>
              </button>

              {isExpanded && (
                <div className="divide-y divide-gray-100">
                  {category.items.map(item => {
                    const state = itemStates[item.id]
                    const isPassed = state?.passed === true
                    const isFailed = state?.passed === false
                    const isIncomplete = isItemFailedIncomplete(item.id)
                    const complete = isItemComplete(item.id)
                    const presets = presetReasons[category.name] || []

                    return (
                      <div key={item.id} className="px-5 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-medium text-gray-800">{item.name}</h4>
                              {complete && isPassed && <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />}
                              {isFailed && complete && <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />}
                              {isFailed && !complete && <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />}
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {complete && (
                              <CheckCircle size={16} className="text-emerald-500" />
                            )}
                            {isFailed && !complete && (
                              <AlertTriangle size={16} className="text-amber-500" />
                            )}
                            <span className="text-xs text-gray-400 whitespace-nowrap mt-0.5">
                              满分 {item.maxScore}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mt-3">
                          <button
                            onClick={() => setItemPassed(item.id, true)}
                            disabled={submitted}
                            className={cn(
                              'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all border',
                              isPassed
                                ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-sm shadow-emerald-100'
                                : 'bg-white border-gray-200 text-gray-400 hover:border-emerald-300 hover:text-emerald-600',
                              submitted && 'cursor-default'
                            )}
                          >
                            <CheckCircle size={15} />
                            合格
                          </button>
                          <button
                            onClick={() => setItemPassed(item.id, false)}
                            disabled={submitted}
                            className={cn(
                              'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all border',
                              isFailed
                                ? 'bg-red-50 border-red-400 text-red-700 shadow-sm shadow-red-100'
                                : 'bg-white border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500',
                              submitted && 'cursor-default'
                            )}
                          >
                            <XCircle size={15} />
                            不合格
                          </button>
                        </div>

                        {isFailed && (
                          <div className="mt-3 space-y-3 pl-1">
                            {isIncomplete && (
                              <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                                <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                <div className="text-xs text-amber-700">
                                  {!state?.deductionReason.trim() && state?.photos.length === 0 && (
                                    <span>请填写扣分原因并上传至少1张照片</span>
                                  )}
                                  {!state?.deductionReason.trim() && state?.photos && state.photos.length > 0 && (
                                    <span>请填写扣分原因</span>
                                  )}
                                  {state?.deductionReason.trim() && (!state?.photos || state.photos.length === 0) && (
                                    <span>请上传至少1张照片</span>
                                  )}
                                </div>
                              </div>
                            )}

                            {presets.length > 0 && (
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">快速选择</label>
                                <div className="flex flex-wrap gap-1.5">
                                  {presets.map(preset => (
                                    <button
                                      key={preset}
                                      type="button"
                                      onClick={() => applyPresetReason(item.id, preset)}
                                      disabled={submitted}
                                      className={cn(
                                        'px-2.5 py-1 text-xs rounded-md transition-colors',
                                        state?.deductionReason === preset
                                          ? 'bg-amber-100 text-amber-700 border border-amber-300'
                                          : 'bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-600 border border-transparent',
                                        submitted && 'cursor-default'
                                      )}
                                    >
                                      {preset}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1.5">扣分原因</label>
                              <textarea
                                value={state?.deductionReason ?? ''}
                                onChange={e => setItemDeduction(item.id, e.target.value)}
                                disabled={submitted}
                                placeholder="请输入扣分原因..."
                                className={cn(
                                  'w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 resize-none disabled:bg-gray-50 disabled:text-gray-400',
                                  isIncomplete && !state?.deductionReason.trim()
                                    ? 'border-red-300 bg-red-50'
                                    : 'border-gray-200'
                                )}
                                rows={2}
                              />
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-medium text-gray-500">
                                  现场照片
                                  {state?.photos && state.photos.length > 0 && (
                                    <span className="ml-2 text-amber-600">
                                      ({state.photos.length} 张)
                                    </span>
                                  )}
                                </label>
                                {isIncomplete && (!state?.photos || state.photos.length === 0) && (
                                  <span className="text-xs text-red-500">请至少上传1张</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                {state?.photos.map((photo, idx) => (
                                  <div
                                    key={idx}
                                    className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200"
                                  >
                                    <img
                                      src={photo}
                                      alt={`照片${idx + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                    {!submitted && (
                                      <button
                                        onClick={() => removePhoto(item.id, idx)}
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors"
                                      >
                                        <X size={12} />
                                      </button>
                                    )}
                                  </div>
                                ))}
                                <button
                                  onClick={() => simulatePhotoUpload(item.id)}
                                  disabled={submitted}
                                  className={cn(
                                    'w-16 h-16 rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-colors',
                                    submitted
                                      ? 'border-gray-200 text-gray-300 cursor-default'
                                      : 'border-gray-300 text-gray-400 hover:border-amber-400 hover:text-amber-500',
                                    isIncomplete && (!state?.photos || state.photos.length === 0) && 'border-red-300'
                                  )}
                                >
                                  <Camera size={18} />
                                  <span className="text-[10px] mt-0.5">拍照存证</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {incompleteFailedCount > 0 && !submitted && (
        <div className="px-4 pb-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-amber-800">需要完善的信息</h4>
                <p className="text-xs text-amber-700 mt-1">
                  还有 <span className="font-bold">{incompleteFailedCount}</span> 个不合格项缺少扣分原因或照片，请补充完整后再提交。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-navy-900 text-white px-6 py-4 shadow-[0_-4px_24px_rgba(0,0,0,0.2)]">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                <circle
                  cx="28" cy="28" r="24"
                  fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4"
                />
                <circle
                  cx="28" cy="28" r="24"
                  fill="none"
                  stroke={progress >= 0.8 ? '#10B981' : progress >= 0.6 ? '#F59E0B' : '#EF4444'}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - progress)}
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold">{Math.round(progress * 100)}%</span>
              </div>
            </div>
            <div>
              <div className="text-lg font-bold leading-tight">
                {totalScore}
                <span className="text-sm text-navy-400 font-normal ml-0.5">/ {totalMaxScore}</span>
              </div>
              <div className="text-xs text-navy-400 mt-0.5">
                已检 {checkedCount}/{totalCount}
                {failedCount > 0 && (
                  <span> · 不合格完整 {failedCompleteCount}/{failedCount}</span>
                )}
                {' · '}等级
                <span className={cn(
                  'ml-1 font-medium',
                  grade === 'A' ? 'text-emerald-400' :
                  grade === 'B' ? 'text-amber-400' :
                  grade === 'C' ? 'text-orange-400' : 'text-red-400'
                )}>
                  {grade}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!canSubmit && !submitted && (
              <span className="text-xs text-navy-400">
                {getSubmitDisabledMessage()}
              </span>
            )}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              title={!canSubmit ? getSubmitDisabledMessage() : ''}
              className={cn(
                'flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all',
                canSubmit
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25 active:scale-95'
                  : 'bg-navy-700/80 text-navy-400 cursor-not-allowed'
              )}
            >
              <Send size={16} />
              {submitted ? '已提交' : '提交巡检'}
            </button>
          </div>
        </div>
      </div>

      {submitted && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 mx-4 max-w-sm w-full text-center shadow-2xl">
            <div className={cn(
              'w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl font-bold text-white',
              grade === 'A' ? 'bg-emerald-500' :
              grade === 'B' ? 'bg-amber-500' :
              grade === 'C' ? 'bg-orange-500' : 'bg-red-500'
            )}>
              {grade}
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-800">巡检已完成</h3>
            <p className="mt-1 text-sm text-gray-500">
              {storeName} · 总分 {totalScore}/{totalMaxScore}
            </p>
            {generatedReportId && (
              <p className="mt-2 text-xs text-emerald-600 bg-emerald-50 inline-block px-3 py-1 rounded-full">
                不合格项已自动生成整改计划
              </p>
            )}
            <div className="mt-6 grid grid-cols-3 gap-2">
              <button
                onClick={() => navigate('/inspections')}
                className="px-3 py-2.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                返回列表
              </button>
              <button
                onClick={() => navigate(`/reports/${generatedReportId}`)}
                className="px-3 py-2.5 text-xs font-medium text-white bg-navy-800 rounded-lg hover:bg-navy-700 transition-colors"
              >
                查看报告
              </button>
              <button
                onClick={() => navigate('/rectifications')}
                className="px-3 py-2.5 text-xs font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors"
              >
                去整改
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
