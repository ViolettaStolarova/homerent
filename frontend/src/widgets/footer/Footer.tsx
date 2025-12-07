import { Link } from 'react-router-dom'
import styles from './Footer.module.scss'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <span className={styles.logoText}>Homerent</span>
        </div>
        <nav className={styles.links}>
          <Link to="/terms" className={styles.link}>
            Условия использования
          </Link>
          <Link to="/about" className={styles.link}>
            Что такое Homerent?
          </Link>
        </nav>
      </div>
    </footer>
  )
}

