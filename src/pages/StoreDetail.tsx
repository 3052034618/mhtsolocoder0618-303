import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapPin, Phone, User, ChevronRight } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useAppStore } from '@/store'
import { GradeBadge } from '@/components/Badge'
import { cn } from '@/lib/utils'

function scoreGrade(score: number) {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  return 'D'
}

function scoreGradeColor(score: number) {
  if (score >= 90) return 'text-emerald-600'
  if (score >= 80) return 'text-blue-600'
  if (score >= 70) return 'text-amber-600'
  return 'text-red-600'
}

function scoreRingColor(score: number) {
  if (score >= 90) return 'border-emerald-500'
  if (score >= 80) return 'border-blue-500'
  if (score >= 70) return 'border-amber-500'
  return 'border-red-500'
}

export default function StoreDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const stores = useAppStore((s) => s.stores)
  const reports = useAppStore((s) => s.reports)

  const store = stores.find((s) => s.id === id)

  if (!store) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-gray-400 text-lg">未找到该门店信息</p>
        <button
          onClick={() => navigate('/stores')}
          className="text-amber-600 hover:text-amber-700 font-medium text-sm"
        >
          返回门店列表
        </button>
      </div>
    )
  }

  const storeReports = reports
    .filter((r) => r.storeId === store.id)
    .sort((a, b) => b.date.localeCompare(a.date))

  const grade = scoreGrade(store.lastScore)

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold font-serif text-navy-900">{store.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
                  store.status === 'normal' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  store.status === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-red-50 text-red-700 border-red-200'
                )}>
                  {store.status === 'normal' ? '正常' : store.status === 'warning' ? '预警' : '高危'}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={16} className="text-navy-400" />
                <span>{store.address}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <User size={16} className="text-navy-400" />
                <span>店长：{store.manager}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={16} className="text-navy-400" />
                <span>{store.phone}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin size={14} />
              <span>区域：{store.region}</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 ml-8">
            <div className={cn(
              'w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center',
              scoreRingColor(store.lastScore)
            )}>
              <span className={cn('text-3xl font-bold', scoreGradeColor(store.lastScore))}>
                {store.lastScore}
              </span>
              <span className={cn('text-xs font-medium', scoreGradeColor(store.lastScore))}>
                {grade}级
              </span>
            </div>
            <span className="text-xs text-gray-400">最近得分</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold font-serif text-navy-900 mb-4">得分趋势</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={store.scoreHistory} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                }}
                formatter={(value: number) => [`${value}分`, '得分']}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#E8913A"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#E8913A', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#E8913A', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold font-serif text-navy-900 mb-4">巡检历史</h2>
        {storeReports.length === 0 ? (
          <p className="text-gray-400 text-sm py-8 text-center">暂无巡检记录</p>
        ) : (
          <div className="relative pl-6">
            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-navy-100" />
            <div className="space-y-5">
              {storeReports.map((report) => (
                <div key={report.id} className="relative flex items-start gap-4">
                  <div className="absolute -left-4 top-1.5 w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-sm" />
                  <div className="flex-1 bg-gray-50/70 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-navy-900">{report.date}</span>
                        <GradeBadge grade={report.grade} />
                      </div>
                      <span className={cn(
                        'text-xl font-bold',
                        scoreGradeColor(report.totalScore)
                      )}>
                        {report.totalScore}分
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">督查员：{report.supervisorName}</span>
                      <Link
                        to={`/reports/${report.id}`}
                        className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 text-xs font-medium transition-colors"
                      >
                        查看报告
                        <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
