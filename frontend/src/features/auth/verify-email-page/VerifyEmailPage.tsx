import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useVerifyEmailMutation } from '@/shared/api/auth'
import styles from './VerifyEmailPage.module.scss'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const [verifyToken, setVerifyToken] = useState('')
  const [verifyEmail, { isLoading, isSuccess }] = useVerifyEmailMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const tokenToUse = token || verifyToken
    if (tokenToUse) {
      try {
        await verifyEmail({ token: tokenToUse }).unwrap()
        setTimeout(() => navigate('/auth/login'), 2000)
      } catch (err) {
        console.error('Verify email error:', err)
      }
    }
  }

  if (isSuccess) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Email подтвержден</h2>
        <p>Ваш email успешно подтвержден. Перенаправление на страницу входа...</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Подтверждение email</h2>
      {token ? (
        <form onSubmit={handleSubmit} className={styles.form}>
          <p>Нажмите кнопку для подтверждения email</p>
          <button type="submit" disabled={isLoading} className={styles.button}>
            {isLoading ? 'Подтверждение...' : 'Подтвердить email'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <p>Введите токен подтверждения из письма</p>
          <input
            type="text"
            value={verifyToken}
            onChange={(e) => setVerifyToken(e.target.value)}
            placeholder="Токен"
            className={styles.input}
          />
          <button type="submit" disabled={isLoading || !verifyToken} className={styles.button}>
            {isLoading ? 'Подтверждение...' : 'Подтвердить email'}
          </button>
        </form>
      )}
    </div>
  )
}

