import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useResetPasswordMutation } from '@/shared/api/auth'
import styles from './ResetPasswordForm.module.scss'

const schema = yup.object({
  password: yup.string().min(6, 'Минимум 6 символов').required('Пароль обязателен'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Пароли не совпадают')
    .required('Подтвердите пароль'),
})

export function ResetPasswordForm() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const [resetPassword, { isLoading, isSuccess }] = useResetPasswordMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: { password: string }) => {
    if (!token) return

    try {
      await resetPassword({ token, password: data.password }).unwrap()
      setTimeout(() => navigate('/auth/login'), 2000)
    } catch (err) {
      console.error('Reset password error:', err)
    }
  }

  if (!token) {
    return (
      <div className={styles.formContainer}>
        <h2 className={styles.title}>Неверная ссылка</h2>
        <p>Токен для сброса пароля отсутствует или недействителен.</p>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className={styles.formContainer}>
        <h2 className={styles.title}>Пароль изменен</h2>
        <p>Пароль успешно изменен. Перенаправление на страницу входа...</p>
      </div>
    )
  }

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.title}>Смена пароля</h2>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.field}>
          <label>Новый пароль</label>
          <input type="password" {...register('password')} />
          {errors.password && <span className={styles.error}>{errors.password.message}</span>}
        </div>
        <div className={styles.field}>
          <label>Подтвердите пароль</label>
          <input type="password" {...register('confirmPassword')} />
          {errors.confirmPassword && (
            <span className={styles.error}>{errors.confirmPassword.message}</span>
          )}
        </div>
        <button type="submit" disabled={isLoading} className={styles.button}>
          {isLoading ? 'Изменение...' : 'Изменить пароль'}
        </button>
      </form>
    </div>
  )
}

