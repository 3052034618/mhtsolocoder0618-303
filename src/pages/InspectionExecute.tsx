import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store'
import type { InspectionItem } from '@/types'
import { CheckCircle, XCircle, Camera, ChevronDown, ChevronUp, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ItemState {
  passed: boolean | null
  deductionReason: string
  photos: string[]
}

export default function InspectionExecute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { plans, templates, updatePlan, addReport } = useAppStore()

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

  const checkedCount = Object.values(itemStates).filter(s => s.passed !== null).length
  const totalCount = Object.keys(itemStates).length
  const allChecked = checkedCount === totalCount && totalCount > 0
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
    setItemStates(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        photos: [...prev[itemId].photos, `photo_${Date.now()}.jpg`]
      }
    }))
  }

  const handleSubmit = () => {
    if (!allChecked || submitted) return

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

    if (plan) {
      updatePlan(plan.id, {
        status: 'completed',
        completedDate: new Date().toISOString().split('T')[0]
      })
    }

    addReport({
      id: `r_${Date.now()}`,
      planId: plan?.id ?? 'demo',
      storeId: plan?.storeId ?? 'demo',
      storeName,
      supervisorName: plan?.supervisorName ?? '演示督查',
      date: new Date().toISOString().split('T')[0],
      totalScore,
      maxScore: totalMaxScore,
      grade,
      items,
    })

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

  return (
    <div className="pb-28">
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

                    return (
                      <div key={item.id} className="px-5 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-medium text-gray-800">{item.name}</h4>
                              {isPassed && <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />}
                              {isFailed && <XCircle size={14} className="text-red-500 flex-shrink-0" />}
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap mt-0.5">
                            满分 {item.maxScore}
                          </span>
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
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1.5">扣分原因</label>
                              <textarea
                                value={state?.deductionReason ?? ''}
                                onChange={e => setItemDeduction(item.id, e.target.value)}
                                disabled={submitted}
                                placeholder="请输入扣分原因..."
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 resize-none disabled:bg-gray-50 disabled:text-gray-400"
                                rows={2}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1.5">现场照片</label>
                              <div className="flex items-center gap-2 flex-wrap">
                                {state?.photos.map((photo, idx) => (
                                  <div
                                    key={idx}
                                    className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 border border-gray-200"
                                  >
                                    照片{idx + 1}
                                  </div>
                                ))}
                                <button
                                  onClick={() => simulatePhotoUpload(item.id)}
                                  disabled={submitted}
                                  className={cn(
                                    'w-16 h-16 rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-colors',
                                    submitted
                                      ? 'border-gray-200 text-gray-300 cursor-default'
                                      : 'border-gray-300 text-gray-400 hover:border-amber-400 hover:text-amber-500'
                                  )}
                                >
                                  <Camera size={18} />
                                  <span className="text-[10px] mt-0.5">拍照</span>
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
                已检 {checkedCount}/{totalCount} · 等级
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
            {!allChecked && !submitted && (
              <span className="text-xs text-navy-400">
                还需检查 {totalCount - checkedCount} 项
              </span>
            )}
            <button
              onClick={handleSubmit}
              disabled={!allChecked || submitted}
              className={cn(
                'flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all',
                allChecked && !submitted
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
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => navigate('/inspections')}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                返回列表
              </button>
              <button
                onClick={() => navigate('/reports')}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-navy-800 rounded-lg hover:bg-navy-700 transition-colors"
              >
                查看报告
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
