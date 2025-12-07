import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link, useNavigate } from 'react-router-dom'
import { useRegisterMutation } from '@/shared/api/auth'
import styles from './RegisterForm.module.scss'

const schema = yup.object({
	email: yup.string().email('Неверный email').required('Email обязателен'),
	password: yup
		.string()
		.min(6, 'Минимум 6 символов')
		.required('Пароль обязателен'),
	confirmPassword: yup
		.string()
		.oneOf([yup.ref('password')], 'Пароли не совпадают')
		.required('Подтвердите пароль'),
	full_name: yup.string().required('ФИО обязательно'),
})

export function RegisterForm() {
	const navigate = useNavigate()
	const [register, { isLoading, error }] = useRegisterMutation()

	const {
		register: registerField,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(schema),
	})

	const onSubmit = async (data: {
		email: string
		password: string
		full_name: string
	}) => {
		try {
			await register(data).unwrap()
			navigate('/auth/verify-email')
		} catch (err: any) {
			console.error('Register error:', err)
		}
	}

	return (
		<div className={styles.formContainer}>
			<h2 className={styles.title}>Регистрация</h2>
			<form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
				<div className={styles.field}>
					<label>Email</label>
					<input type='email' {...registerField('email')} />
					{errors.email && (
						<span className={styles.error}>{errors.email.message}</span>
					)}
				</div>
				<div className={styles.field}>
					<label>ФИО</label>
					<input type='text' {...registerField('full_name')} />
					{errors.full_name && (
						<span className={styles.error}>{errors.full_name.message}</span>
					)}
				</div>
				<div className={styles.field}>
					<label>Пароль</label>
					<input type='password' {...registerField('password')} />
					{errors.password && (
						<span className={styles.error}>{errors.password.message}</span>
					)}
				</div>
				<div className={styles.field}>
					<label>Повторите пароль</label>
					<input type='password' {...registerField('confirmPassword')} />
					{errors.confirmPassword && (
						<span className={styles.error}>
							{errors.confirmPassword.message}
						</span>
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
							return 'Ошибка регистрации. Попробуйте позже.'
						})()}
					</div>
				)}
				<button type='submit' disabled={isLoading} className={styles.button}>
					{isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
				</button>
				<div className={styles.links}>
					<Link to='/auth/login'>Уже есть аккаунт? Войти</Link>
				</div>
			</form>
		</div>
	)
}
