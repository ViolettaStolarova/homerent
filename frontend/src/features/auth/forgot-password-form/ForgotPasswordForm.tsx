import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link } from 'react-router-dom'
import { useForgotPasswordMutation } from '@/shared/api/auth'
import styles from './ForgotPasswordForm.module.scss'

const schema = yup.object({
  email: yup.string().email('Неверный email').required('Email обязателен'),
})

export function ForgotPasswordForm() {
  const [forgotPassword, { isLoading, isSuccess }] = useForgotPasswordMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: { email: string }) => {
    try {
      await forgotPassword(data).unwrap()
    } catch (err) {
      console.error('Forgot password error:', err)
    }
  }

  if (isSuccess) {
    return (
      <div className={styles.formContainer}>
        <h2 className={styles.title}>Письмо отправлено</h2>
        <p className={styles.message}>
          Если email существует, на него была отправлена ссылка для сброса пароля.
        </p>
        <Link to="/auth/login" className={styles.link}>
          Вернуться к входу
        </Link>
      </div>
    )
  }

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.title}>Восстановление пароля</h2>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.field}>
          <label>Email</label>
          <input type="email" {...register('email')} />
          {errors.email && <span className={styles.error}>{errors.email.message}</span>}
        </div>
        <button type="submit" disabled={isLoading} className={styles.button}>
          {isLoading ? 'Отправка...' : 'Отправить ссылку'}
        </button>
        <div className={styles.links}>
          <Link to="/auth/login">Вернуться к входу</Link>
        </div>
      </form>
    </div>
  )
}

