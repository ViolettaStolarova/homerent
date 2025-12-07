import { Avatar } from '@mui/material'
import styles from './OwnerInfo.module.scss'

interface OwnerInfoProps {
  ownerName: string
  ownerSince: string
}

export function OwnerInfo({ ownerName, ownerSince }: OwnerInfoProps) {
  const sinceDate = ownerSince ? new Date(ownerSince).getFullYear() : null

  return (
    <div className={styles.ownerInfo}>
      <h3>Хозяин</h3>
      <div className={styles.content}>
        <Avatar className={styles.avatar}>{ownerName.charAt(0).toUpperCase()}</Avatar>
        <div className={styles.details}>
          <div className={styles.name}>{ownerName}</div>
          {sinceDate && <div className={styles.since}>На платформе с {sinceDate}</div>}
        </div>
      </div>
    </div>
  )
}

