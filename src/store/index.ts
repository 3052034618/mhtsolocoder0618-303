import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Store, InspectionPlan, InspectionReport, Rectification, ScoreTemplate, InspectionItem } from '@/types'
import { stores as mockStores, inspectionPlans as mockPlans, inspectionReports as mockReports, rectifications as mockRectifications, scoreTemplates as mockTemplates, supervisors as mockSupervisors } from '@/data/mock'

interface AppState {
  stores: Store[]
  plans: InspectionPlan[]
  reports: InspectionReport[]
  rectifications: Rectification[]
  templates: ScoreTemplate[]
  supervisors: { id: string; name: string }[]

  addPlan: (plan: InspectionPlan) => void
  updatePlan: (id: string, updates: Partial<InspectionPlan>) => void
  addReport: (report: InspectionReport) => void
  addRectification: (rectification: Rectification) => void
  updateRectification: (id: string, updates: Partial<Rectification>) => void
  addRectifications: (rectifications: Rectification[]) => void
  updateTemplate: (id: string, updates: Partial<ScoreTemplate>) => void
  updateStoreScore: (storeId: string, newScore: number, date: string) => void
  resetAll: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      stores: mockStores,
      plans: mockPlans,
      reports: mockReports,
      rectifications: mockRectifications,
      templates: mockTemplates,
      supervisors: mockSupervisors,

      addPlan: (plan) => set((state) => ({ plans: [...state.plans, plan] })),
      updatePlan: (id, updates) => set((state) => ({
        plans: state.plans.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      })),
      addReport: (report) => set((state) => ({ reports: [report, ...state.reports] })),
      addRectification: (rectification) => set((state) => ({
        rectifications: [...state.rectifications, rectification],
      })),
      addRectifications: (newRects) => set((state) => ({
        rectifications: [...state.rectifications, ...newRects],
      })),
      updateRectification: (id, updates) => set((state) => ({
        rectifications: state.rectifications.map((r) => (r.id === id ? { ...r, ...updates } : r)),
      })),
      updateTemplate: (id, updates) => set((state) => ({
        templates: state.templates.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      })),
      updateStoreScore: (storeId, newScore, date) => set((state) => ({
        stores: state.stores.map((s) => {
          if (s.id !== storeId) return s
          const monthKey = date.slice(0, 7)
          const existing = s.scoreHistory.find((h) => h.date === monthKey)
          let newHistory
          if (existing) {
            newHistory = s.scoreHistory.map((h) =>
              h.date === monthKey ? { date: monthKey, score: newScore } : h
            )
          } else {
            newHistory = [...s.scoreHistory, { date: monthKey, score: newScore }]
          }
          const avgScore = Math.round(newHistory.reduce((sum, h) => sum + h.score, 0) / newHistory.length * 10) / 10
          const status = newScore >= 80 ? 'normal' : newScore >= 60 ? 'warning' : 'danger'
          return { ...s, lastScore: newScore, avgScore, status, scoreHistory: newHistory }
        }),
      })),
      resetAll: () => set({
        stores: mockStores,
        plans: mockPlans,
        reports: mockReports,
        rectifications: mockRectifications,
        templates: mockTemplates,
      }),
    }),
    {
      name: 'qc-inspection-store',
      version: 1,
    }
  )
)
