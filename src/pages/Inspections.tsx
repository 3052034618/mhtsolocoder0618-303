import { useState, useMemo } from 'react'
import { Plus, Filter, Calendar, List, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useAppStore } from '@/store'
import { StatusBadge } from '@/components/Badge'
import { cn } from '@/lib/utils'
import type { InspectionPlan } from '@/types'

type ViewMode = 'table' | 'calendar'
type StatusFilter = 'all' | 'planned' | 'in_progress' | 'completed'
type TypeFilter = 'all' | 'surprise' | 'scheduled'

interface FormState {
  storeId: string
  supervisorId: string
  type: 'surprise' | 'scheduled'
  scheduledDate: string
  templateId: string
}

const initialForm: FormState = {
  storeId: '',
  supervisorId: '',
  type: 'scheduled',
  scheduledDate: '',
  templateId: '',
}

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'planned', label: '已计划' },
  { value: 'in_progress', label: '进行中' },
  { value: 'completed', label: '已完成' },
]

const typeOptions: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'surprise', label: '突击' },
  { value: 'scheduled', label: '预约' },
]

export default function Inspections() {
  const { plans, stores, supervisors, templates, addPlan } = useAppStore()

  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [supervisorFilter, setSupervisorFilter] = useState('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [form, setForm] = useState<FormState>(initialForm)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      if (typeFilter !== 'all' && p.type !== typeFilter) return false
      if (supervisorFilter !== 'all' && p.supervisorId !== supervisorFilter) return false
      return true
    })
  }, [plans, statusFilter, typeFilter, supervisorFilter])

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: calStart, end: calEnd })
  }, [currentMonth])

  const plansByDate = useMemo(() => {
    const map = new Map<string, InspectionPlan[]>()
    plans.forEach((p) => {
      const key = p.scheduledDate
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(p)
    })
    return map
  }, [plans])

  const handleSubmit = () => {
    if (!form.storeId || !form.supervisorId || !form.scheduledDate || !form.templateId) return

    const store = stores.find((s) => s.id === form.storeId)
    const supervisor = supervisors.find((s) => s.id === form.supervisorId)
    const template = templates.find((t) => t.id === form.templateId)
    if (!store || !supervisor || !template) return

    addPlan({
      id: `p${Date.now()}`,
      storeId: form.storeId,
      storeName: store.name,
      supervisorId: form.supervisorId,
      supervisorName: supervisor.name,
      type: form.type,
      status: 'planned',
      scheduledDate: form.scheduledDate,
      templateId: form.templateId,
      templateName: template.name,
    })

    setForm(initialForm)
    setDrawerOpen(false)
  }

  const weekDays = ['一', '二', '三', '四', '五', '六', '日']

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-navy-800 font-serif">巡检计划</h1>
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors shadow-sm"
        >
          <Plus size={16} />
          新建计划
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-navy-400" />
            <span className="text-sm text-navy-500">筛选</span>
          </div>

          <div className="flex items-center gap-1.5">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm transition-colors',
                  statusFilter === opt.value
                    ? 'bg-navy-800 text-white'
                    : 'bg-gray-100 text-navy-600 hover:bg-gray-200'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {typeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTypeFilter(opt.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm transition-colors',
                  typeFilter === opt.value
                    ? 'bg-navy-800 text-white'
                    : 'bg-gray-100 text-navy-600 hover:bg-gray-200'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <select
            value={supervisorFilter}
            onChange={(e) => setSupervisorFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-navy-600 border-0 focus:ring-2 focus:ring-amber-500/30 focus:bg-white transition-colors"
          >
            <option value="all">全部督导</option>
            {supervisors.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <div className="ml-auto flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                viewMode === 'table' ? 'bg-white shadow-sm text-navy-800' : 'text-navy-400 hover:text-navy-600'
              )}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                viewMode === 'calendar' ? 'bg-white shadow-sm text-navy-800' : 'text-navy-400 hover:text-navy-600'
              )}
            >
              <Calendar size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-xs font-medium text-navy-400 uppercase tracking-wider">门店名称</th>
                <th className="text-left px-5 py-3.5 text-xs font-medium text-navy-400 uppercase tracking-wider">督导</th>
                <th className="text-left px-5 py-3.5 text-xs font-medium text-navy-400 uppercase tracking-wider">巡检类型</th>
                <th className="text-left px-5 py-3.5 text-xs font-medium text-navy-400 uppercase tracking-wider">计划日期</th>
                <th className="text-left px-5 py-3.5 text-xs font-medium text-navy-400 uppercase tracking-wider">状态</th>
                <th className="text-left px-5 py-3.5 text-xs font-medium text-navy-400 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPlans.map((plan) => (
                <tr key={plan.id} className="hover:bg-amber-50/30 transition-colors">
                  <td className="px-5 py-3.5 text-sm text-navy-800 font-medium">{plan.storeName}</td>
                  <td className="px-5 py-3.5 text-sm text-navy-600">{plan.supervisorName}</td>
                  <td className="px-5 py-3.5">
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
                      plan.type === 'surprise'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    )}>
                      {plan.type === 'surprise' ? '突击' : '预约'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-navy-600">
                    {format(parseISO(plan.scheduledDate), 'yyyy-MM-dd', { locale: zhCN })}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={plan.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button className="text-xs text-navy-400 hover:text-navy-700 transition-colors">查看</button>
                      {(plan.status === 'planned' || plan.status === 'in_progress') && (
                        <button className="text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors">执行</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPlans.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-navy-400">暂无匹配的巡检计划</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-navy-500 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-lg font-semibold text-navy-800">
              {format(currentMonth, 'yyyy年M月', { locale: zhCN })}
            </h2>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-navy-500 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-lg overflow-hidden">
            {weekDays.map((d) => (
              <div key={d} className="bg-gray-50 py-2 text-center text-xs font-medium text-navy-400">
                {d}
              </div>
            ))}

            {calendarDays.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd')
              const dayPlans = plansByDate.get(dateKey) || []
              const isCurrentMonth = isSameMonth(day, currentMonth)
              const isToday = isSameDay(day, new Date())

              return (
                <div
                  key={dateKey}
                  className={cn(
                    'bg-white min-h-[80px] p-2 transition-colors',
                    !isCurrentMonth && 'bg-gray-50/50',
                    isToday && 'bg-amber-50/50'
                  )}
                >
                  <div className={cn(
                    'text-sm mb-1',
                    isToday ? 'font-bold text-amber-600' : isCurrentMonth ? 'text-navy-700' : 'text-navy-300'
                  )}>
                    {format(day, 'd')}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {dayPlans.slice(0, 3).map((p) => (
                      <span
                        key={p.id}
                        className={cn(
                          'w-2 h-2 rounded-full',
                          p.type === 'surprise' ? 'bg-red-400' : 'bg-blue-400',
                          p.status === 'completed' && 'opacity-40'
                        )}
                        title={`${p.storeName} - ${p.type === 'surprise' ? '突击' : '预约'}`}
                      />
                    ))}
                    {dayPlans.length > 3 && (
                      <span className="text-[10px] text-navy-400 leading-none">+{dayPlans.length - 3}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex items-center gap-5 mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-xs text-navy-500">预约巡检</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-xs text-navy-500">突击巡检</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 opacity-40" />
              <span className="text-xs text-navy-500">已完成</span>
            </div>
          </div>
        </div>
      )}

      {/* Drawer Overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 transition-opacity"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Create Plan Drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-[440px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out',
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-navy-800">新建巡检计划</h2>
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-navy-400 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1.5">选择门店</label>
              <select
                value={form.storeId}
                onChange={(e) => setForm({ ...form, storeId: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-navy-800 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-colors bg-white"
              >
                <option value="">请选择门店</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1.5">选择督导</label>
              <select
                value={form.supervisorId}
                onChange={(e) => setForm({ ...form, supervisorId: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-navy-800 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-colors bg-white"
              >
                <option value="">请选择督导</option>
                {supervisors.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1.5">巡检类型</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setForm({ ...form, type: 'scheduled' })}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-colors',
                    form.type === 'scheduled'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-navy-500 hover:border-gray-300'
                  )}
                >
                  预约
                </button>
                <button
                  onClick={() => setForm({ ...form, type: 'surprise' })}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-colors',
                    form.type === 'surprise'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 text-navy-500 hover:border-gray-300'
                  )}
                >
                  突击
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1.5">计划日期</label>
              <input
                type="date"
                value={form.scheduledDate}
                onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-navy-800 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1.5">评分模板</label>
              <select
                value={form.templateId}
                onChange={(e) => setForm({ ...form, templateId: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-navy-800 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-colors bg-white"
              >
                <option value="">请选择模板</option>
                {templates.filter((t) => t.isActive).map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
            <button
              onClick={() => { setForm(initialForm); setDrawerOpen(false) }}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-navy-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.storeId || !form.supervisorId || !form.scheduledDate || !form.templateId}
              className={cn(
                'flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors',
                form.storeId && form.supervisorId && form.scheduledDate && form.templateId
                  ? 'bg-amber-500 text-white hover:bg-amber-600'
                  : 'bg-amber-200 text-amber-400 cursor-not-allowed'
              )}
            >
              确认创建
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
