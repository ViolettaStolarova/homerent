import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link, useNavigate } from 'react-router-dom'
import { useLoginMutation } from '@/shared/api/auth'
import styles from './LoginForm.module.scss'

const schema = yup.object({
	email: yup.string().email('Неверный email').required('Email обязателен'),
	password: yup.string().required('Пароль обязателен'),
})

export function LoginForm() {
	const navigate = useNavigate()
	const [login, { isLoading, error }] = useLoginMutation()

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(schema),
	})

	const onSubmit = async (data: { email: string; password: string }) => {
		try {
			const result = await login(data).unwrap()
			localStorage.setItem('token', result.token)
			navigate('/')
			window.location.reload()
		} catch (err: any) {
			console.error('Login error:', err)
		}
	}

	return (
		<div className={styles.formContainer}>
			<h2 className={styles.title}>Вход</h2>
			<form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
				<div className={styles.field}>
					<label>Email</label>
					<input type='email' {...register('email')} />
					{errors.email && (
						<span className={styles.error}>{errors.email.message}</span>
					)}
				</div>
				<div className={styles.field}>
					<label>Пароль</label>
					<input type='password' {...register('password')} />
					{errors.password && (
						<span className={styles.error}>{errors.password.message}</span>
					)}
				</div>
				{error && (
					<div className={styles.errorMessage}>
						{(() => {
							if (
								'data' in error &&
								typeof error.data === 'object' &&
								error.data &&
								'error' in error.data
							) {
								return String(error.data.error)
							}
							if ('error' in error && typeof error.error === 'string') {
								return error.error
							}
							return 'Неверный email или пароль'
						})()}
					</div>
				)}
				<button type='submit' disabled={isLoading} className={styles.button}>
					{isLoading ? 'Вход...' : 'Войти'}
				</button>
				<div className={styles.links}>
					<Link to='/auth/forgot-password'>Забыли пароль?</Link>
					<Link to='/auth/register'>Регистрация</Link>
				</div>
			</form>
		</div>
	)
}
