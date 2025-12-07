import styles from './AboutPage.module.scss'

export function AboutPage() {
  return (
    <div className={styles.aboutPage}>
      <div className={styles.container}>
        <h1 className={styles.title}>О Homerent</h1>
        
        <section className={styles.section}>
          <h2>Что такое Homerent?</h2>
          <p>
            Homerent — это современная платформа для аренды недвижимости, которая объединяет 
            владельцев жилья и путешественников. Мы создали удобный и безопасный сервис, 
            который позволяет легко находить и снимать квартиры, дома, комнаты и коттеджи 
            по всей России.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Наша миссия</h2>
          <p>
            Мы стремимся сделать аренду недвижимости простой, прозрачной и доступной для всех. 
            Наша цель — создать сообщество доверия, где каждый может найти идеальное жилье 
            для отдыха или работы, а владельцы могут легко и безопасно сдавать свою недвижимость.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Почему выбирают нас?</h2>
          <div className={styles.features}>
            <div className={styles.feature}>
              <h3>Широкий выбор</h3>
              <p>
                Тысячи объявлений по всей России — от уютных квартир в центре города 
                до загородных домов с бассейном.
              </p>
            </div>
            <div className={styles.feature}>
              <h3>Безопасность</h3>
              <p>
                Все пользователи проходят верификацию, система отзывов помогает сделать 
                правильный выбор.
              </p>
            </div>
            <div className={styles.feature}>
              <h3>Удобство</h3>
              <p>
                Простой поиск, удобное бронирование, прозрачные цены — все для вашего комфорта.
              </p>
            </div>
            <div className={styles.feature}>
              <h3>Поддержка</h3>
              <p>
                Наша команда всегда готова помочь вам с любыми вопросами и решить возникшие проблемы.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Как это работает?</h2>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <h3>Регистрация</h3>
              <p>Создайте аккаунт и подтвердите email</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <h3>Поиск</h3>
              <p>Найдите подходящее жилье с помощью фильтров</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <h3>Бронирование</h3>
              <p>Забронируйте понравившееся жилье на нужные даты</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <h3>Отдых</h3>
              <p>Наслаждайтесь комфортным пребыванием</p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Для владельцев</h2>
          <p>
            Если вы владеете недвижимостью и хотите сдавать её в аренду, Homerent — идеальная 
            платформа для вас. Разместите объявление бесплатно, управляйте бронированиями 
            в удобном личном кабинете, получайте отзывы от гостей и расширяйте свой бизнес.
          </p>
        </section>

        <section className={styles.contact}>
          <h2>Свяжитесь с нами</h2>
          <p>
            Если у вас есть вопросы или предложения, мы будем рады услышать от вас.
          </p>
          <p className={styles.email}>Email: support@homerent.ru</p>
        </section>
      </div>
    </div>
  )
}

