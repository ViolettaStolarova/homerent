import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/widgets/layout'
import { HomePage } from '@/pages/home'
import { PropertyPage } from '@/pages/property'
import { ProfilePage } from '@/pages/profile'
import { AdminPage } from '@/pages/admin'
import { AuthPage } from '@/pages/auth'
import { PropertyFormPage } from '@/pages/property-form'
import { AboutPage } from '@/pages/about'
import { TermsPage } from '@/pages/terms'

function App() {
  return (
    <Routes>
      <Route path="/auth/*" element={<AuthPage />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="property/:id" element={<PropertyPage />} />
        <Route path="profile/*" element={<ProfilePage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="property/new" element={<PropertyFormPage />} />
        <Route path="property/edit/:id" element={<PropertyFormPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="terms" element={<TermsPage />} />
      </Route>
    </Routes>
  )
}

export default App

