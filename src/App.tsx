import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import Inspections from '@/pages/Inspections'
import InspectionExecute from '@/pages/InspectionExecute'
import Reports from '@/pages/Reports'
import ReportDetail from '@/pages/ReportDetail'
import Rectifications from '@/pages/Rectifications'
import Stores from '@/pages/Stores'
import StoreDetail from '@/pages/StoreDetail'
import Templates from '@/pages/Templates'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inspections" element={<Inspections />} />
          <Route path="execute" element={<InspectionExecute />} />
          <Route path="inspections/:id/execute" element={<InspectionExecute />} />
          <Route path="reports" element={<Reports />} />
          <Route path="reports/:id" element={<ReportDetail />} />
          <Route path="rectifications" element={<Rectifications />} />
          <Route path="stores" element={<Stores />} />
          <Route path="stores/:id" element={<StoreDetail />} />
          <Route path="templates" element={<Templates />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
