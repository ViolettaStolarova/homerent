import { useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Tabs, Tab } from '@mui/material'
import { ProfileTab } from '@/shared/types'
import { PersonalInfoTab } from '@/features/profile/personal-info-tab'
import { BookingsTab } from '@/features/profile/bookings-tab'
import { PropertiesTab } from '@/features/profile/properties-tab'
import { IncomingBookingsTab } from '@/features/profile/incoming-bookings-tab'
import { FavoritesTab } from '@/features/profile/favorites-tab'
import styles from './ProfilePage.module.scss'

export function ProfilePage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(ProfileTab.PERSONAL)

  const handleTabChange = (_: unknown, newValue: ProfileTab) => {
    setActiveTab(newValue)
    navigate(`/profile/${newValue}`)
  }

  return (
    <div className={styles.profilePage}>
      <div className={styles.container}>
        <Tabs value={activeTab} onChange={handleTabChange} className={styles.tabs}>
          <Tab label="Личная информация" value={ProfileTab.PERSONAL} />
          <Tab label="Мои бронирования" value={ProfileTab.BOOKINGS} />
          <Tab label="Мои объявления" value={ProfileTab.PROPERTIES} />
          <Tab label="Бронирования на мои объявления" value={ProfileTab.INCOMING_BOOKINGS} />
          <Tab label="Избранное" value={ProfileTab.FAVORITES} />
        </Tabs>

        <div className={styles.content}>
          <Routes>
            <Route path="personal" element={<PersonalInfoTab />} />
            <Route path="bookings" element={<BookingsTab />} />
            <Route path="properties" element={<PropertiesTab />} />
            <Route path="incoming_bookings" element={<IncomingBookingsTab />} />
            <Route path="favorites" element={<FavoritesTab />} />
            <Route path="*" element={<Navigate to="/profile/personal" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

