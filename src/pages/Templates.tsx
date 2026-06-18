import { useState } from 'react'
import { Plus, ChevronDown, ChevronUp, ToggleLeft, ToggleRight } from 'lucide-react'
import { useAppStore } from '@/store'
import { Badge } from '@/components/Badge'
import { cn } from '@/lib/utils'

export default function Templates() {
  const templates = useAppStore((s) => s.templates)
  const updateTemplate = useAppStore((s) => s.updateTemplate)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const toggleActive = (id: string, current: boolean) => {
    updateTemplate(id, { isActive: !current })
  }

  const totalItems = (categories: { items: unknown[] }[]) =>
    categories.reduce((sum, c) => sum + c.items.length, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-serif text-navy-900">评分模板</h1>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
          <Plus size={16} />
          新建模板
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {templates.map((tpl) => {
          const isExpanded = expandedId === tpl.id
          const itemCount = totalItems(tpl.categories)

          return (
            <div
              key={tpl.id}
              className={cn(
                'bg-white rounded-xl shadow-sm border transition-all duration-200',
                isExpanded ? 'border-amber-300 shadow-md col-span-1 lg:col-span-2' : 'border-gray-100 hover:border-amber-200'
              )}
            >
              <div
                className="p-5 cursor-pointer"
                onClick={() => toggleExpand(tpl.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-semibold text-navy-900 truncate">{tpl.name}</h3>
                      <Badge variant={tpl.isActive ? 'success' : 'default'}>
                        {tpl.isActive ? '启用中' : '已停用'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{tpl.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>{itemCount} 个检查项</span>
                      <span className="w-px h-3 bg-gray-200" />
                      <span>已使用 {tpl.usageCount} 次</span>
                      <span className="w-px h-3 bg-gray-200" />
                      <span>{tpl.categories.length} 个分类</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleActive(tpl.id, tpl.isActive)
                      }}
                      className="flex-shrink-0"
                    >
                      {tpl.isActive ? (
                        <ToggleRight size={28} className="text-amber-500" />
                      ) : (
                        <ToggleLeft size={28} className="text-gray-300" />
                      )}
                    </button>
                    <button className="flex-shrink-0 text-gray-400 hover:text-navy-700 transition-colors">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 px-5 pb-5 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {tpl.categories.map((cat) => (
                      <div key={cat.id} className="bg-gray-50/80 rounded-lg p-4 border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-navy-800">{cat.name}</h4>
                          <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded">
                            权重 {cat.weight}%
                          </span>
                        </div>
                        <div className="space-y-2">
                          {cat.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between py-1.5 px-2 rounded bg-white border border-gray-50"
                            >
                              <span className="text-xs text-gray-700 truncate mr-2">{item.name}</span>
                              <span className="text-xs font-medium text-navy-600 flex-shrink-0">
                                {item.maxScore}分
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
