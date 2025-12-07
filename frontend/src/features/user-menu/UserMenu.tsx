import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Avatar, Menu, MenuItem } from '@mui/material'
import { useMeQuery } from '@/shared/api/auth'
import styles from './UserMenu.module.scss'

interface UserMenuProps {
  user: {
    id: number
    full_name: string
    avatar_url?: string
    role: string
  }
}

export function UserMenu({ user }: UserMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const navigate = useNavigate()

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
    window.location.reload()
  }

  return (
    <>
      <div className={styles.userMenu} onClick={handleClick}>
        <Avatar src={user.avatar_url} className={styles.avatar}>
          {user.full_name.charAt(0).toUpperCase()}
        </Avatar>
        <span className={styles.name}>{user.full_name}</span>
      </div>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem component={Link} to="/profile" onClick={handleClose}>
          Профиль
        </MenuItem>
        {user.role === 'admin' && (
          <MenuItem component={Link} to="/admin" onClick={handleClose}>
            Админ-панель
          </MenuItem>
        )}
        <MenuItem onClick={handleLogout}>Выйти</MenuItem>
      </Menu>
    </>
  )
}

