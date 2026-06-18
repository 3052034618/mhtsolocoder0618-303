import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, FileCheck, FileText, Wrench, Store, FileBarChart, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: '总部看板' },
  { to: '/inspections', icon: ClipboardList, label: '巡检计划' },
  { to: '/execute', icon: FileCheck, label: '巡检执行' },
  { to: '/reports', icon: FileText, label: '巡检报告' },
  { to: '/rectifications', icon: Wrench, label: '整改管理' },
  { to: '/stores', icon: Store, label: '门店管理' },
  { to: '/templates', icon: FileBarChart, label: '评分模板' },
]

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        className={`${
          collapsed ? 'w-[72px]' : 'w-[240px]'
        } bg-navy-900 text-white flex flex-col transition-all duration-300 ease-in-out relative`}
      >
        <div className="h-16 flex items-center px-5 border-b border-navy-700/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
              <FileCheck size={20} className="text-white" />
            </div>
            {!collapsed && (
              <div className="whitespace-nowrap">
                <h1 className="text-base font-semibold font-serif leading-tight">品控巡检</h1>
                <p className="text-[10px] text-navy-300 leading-tight">连锁门店质量稽查系统</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 mx-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 font-medium'
                    : 'text-navy-200 hover:bg-navy-800 hover:text-white'
                }`
              }
            >
              <item.icon size={20} className="flex-shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-navy-700 rounded-full flex items-center justify-center text-navy-200 hover:bg-navy-600 hover:text-white transition-colors shadow-lg border border-navy-600"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className="p-4 border-t border-navy-700/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-navy-600 flex items-center justify-center flex-shrink-0 text-xs font-medium">
              管
            </div>
            {!collapsed && (
              <div className="whitespace-nowrap">
                <p className="text-sm font-medium">系统管理员</p>
                <p className="text-[10px] text-navy-400">总部管理</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#F0F2F5]">
        <Outlet />
      </main>
    </div>
  )
}
