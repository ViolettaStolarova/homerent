import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginForm } from '@/features/auth/login-form'
import { RegisterForm } from '@/features/auth/register-form'
import { ForgotPasswordForm } from '@/features/auth/forgot-password-form'
import { ResetPasswordForm } from '@/features/auth/reset-password-form'
import { VerifyEmailPage } from '@/features/auth/verify-email-page'
import styles from './AuthPage.module.scss'

export function AuthPage() {
	return (
		<div className={styles.authPage}>
			<div className={styles.container}>
				<Routes>
					<Route path='login' element={<LoginForm />} />
					<Route path='register' element={<RegisterForm />} />
					<Route path='forgot-password' element={<ForgotPasswordForm />} />
					<Route path='reset-password' element={<ResetPasswordForm />} />
					<Route path='verify-email' element={<VerifyEmailPage />} />
					<Route path='*' element={<Navigate to='/auth/login' replace />} />
				</Routes>
			</div>
		</div>
	)
}
