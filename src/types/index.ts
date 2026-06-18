export interface Store {
  id: string
  name: string
  region: string
  address: string
  manager: string
  phone: string
  lastScore: number
  avgScore: number
  status: 'normal' | 'warning' | 'danger'
  scoreHistory: { date: string; score: number }[]
}

export interface InspectionPlan {
  id: string
  storeId: string
  storeName: string
  supervisorId: string
  supervisorName: string
  type: 'surprise' | 'scheduled'
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  scheduledDate: string
  completedDate?: string
  templateId: string
  templateName: string
}

export interface InspectionItem {
  id: string
  category: string
  name: string
  maxScore: number
  score: number
  passed: boolean
  photos?: string[]
  deductionReason?: string
}

export interface InspectionReport {
  id: string
  planId: string
  storeId: string
  storeName: string
  supervisorName: string
  date: string
  totalScore: number
  maxScore: number
  grade: 'A' | 'B' | 'C' | 'D'
  items: InspectionItem[]
}

export interface Rectification {
  id: string
  reportId: string
  itemId: string
  storeId: string
  storeName: string
  itemName: string
  category: string
  deductionReason: string
  status: 'pending' | 'planned' | 'rectifying' | 'completed'
  plan?: string
  deadline?: string
  rectificationPhotos?: string[]
  submittedAt?: string
  confirmedAt?: string
  confirmedBy?: string
}

export interface TemplateItem {
  id: string
  name: string
  maxScore: number
  description: string
}

export interface TemplateCategory {
  id: string
  name: string
  weight: number
  items: TemplateItem[]
}

export interface ScoreTemplate {
  id: string
  name: string
  description: string
  isActive: boolean
  usageCount: number
  categories: TemplateCategory[]
}
