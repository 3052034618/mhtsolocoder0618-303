import { create } from 'zustand'
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
  updateRectification: (id: string, updates: Partial<Rectification>) => void
  updateTemplate: (id: string, updates: Partial<ScoreTemplate>) => void
  updateInspectionItem: (planId: string, itemId: string, updates: Partial<InspectionItem>) => void
}

export const useAppStore = create<AppState>((set) => ({
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
  addReport: (report) => set((state) => ({ reports: [...state.reports, report] })),
  updateRectification: (id, updates) => set((state) => ({
    rectifications: state.rectifications.map((r) => (r.id === id ? { ...r, ...updates } : r)),
  })),
  updateTemplate: (id, updates) => set((state) => ({
    templates: state.templates.map((t) => (t.id === id ? { ...t, ...updates } : t)),
  })),
  updateInspectionItem: (planId, itemId, updates) => set((state) => ({
    reports: state.reports.map((r) =>
      r.planId === planId
        ? { ...r, items: r.items.map((i) => (i.id === itemId ? { ...i, ...updates } : i)) }
        : r
    ),
  })),
}))
