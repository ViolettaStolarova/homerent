import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useGetProfileQuery, useUpdateProfileMutation, useChangePasswordMutation } from '@/shared/api/users'
import styles from './PersonalInfoTab.module.scss'

export function PersonalInfoTab() {
  const { data: profile, isLoading } = useGetProfileQuery()
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation()
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation()
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: profile as {
      full_name?: string
      username?: string
      phone?: string
      email?: string
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm()

  const onProfileSubmit = async (data: unknown) => {
    try {
      await updateProfile(data as {
        full_name?: string
        username?: string
        phone?: string
        avatar_url?: string
      }).unwrap()
    } catch (err) {
      console.error('Update profile error:', err)
    }
  }

  const onPasswordSubmit = async (data: { old_password: string; new_password: string }) => {
    try {
      await changePassword(data).unwrap()
      setShowPasswordForm(false)
      resetPasswordForm()
    } catch (err) {
      console.error('Change password error:', err)
    }
  }

  if (isLoading) {
    return <div>Загрузка...</div>
  }

  return (
    <div className={styles.tab}>
      <h2>Личная информация</h2>
      <form onSubmit={handleProfileSubmit(onProfileSubmit)} className={styles.form}>
        <div className={styles.field}>
          <label>ФИО</label>
          <input type="text" {...registerProfile('full_name')} />
          {profileErrors.full_name && (
            <span className={styles.error}>{profileErrors.full_name.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label>Логин</label>
          <input type="text" {...registerProfile('username')} />
          {profileErrors.username && (
            <span className={styles.error}>{profileErrors.username.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label>Телефон</label>
          <input type="tel" {...registerProfile('phone')} />
          {profileErrors.phone && (
            <span className={styles.error}>{profileErrors.phone.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label>Email</label>
          <input type="email" value={(profile as { email?: string })?.email || ''} disabled />
        </div>

        <button type="submit" disabled={isUpdating} className={styles.button}>
          {isUpdating ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </form>

      <div className={styles.passwordSection}>
        <button onClick={() => setShowPasswordForm(!showPasswordForm)} className={styles.toggleButton}>
          Сменить пароль
        </button>

        {showPasswordForm && (
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className={styles.passwordForm}>
            <div className={styles.field}>
              <label>Текущий пароль</label>
              <input type="password" {...registerPassword('old_password', { required: true })} />
              {passwordErrors.old_password && (
                <span className={styles.error}>Обязательное поле</span>
              )}
            </div>

            <div className={styles.field}>
              <label>Новый пароль</label>
              <input
                type="password"
                {...registerPassword('new_password', { required: true, minLength: 6 })}
              />
              {passwordErrors.new_password && (
                <span className={styles.error}>Минимум 6 символов</span>
              )}
            </div>

            <button type="submit" disabled={isChangingPassword} className={styles.button}>
              {isChangingPassword ? 'Изменение...' : 'Изменить пароль'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
