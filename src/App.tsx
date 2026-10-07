import { Link, NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { ScrollToTop } from './components/ScrollToTop'
import { DetailView } from './pages/DetailView'
import { GalleryView } from './pages/GalleryView'
import { ListView } from './pages/ListView'
import styles from './App.module.css'

const navClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink

function App() {
  return (
    <div className={styles.shell}>
      <ScrollToTop />
      <header className={styles.topBar}>
        <div className={styles.topBarInner}>
          <Link to="/" className={styles.brand}>
            <span className={styles.logo} aria-hidden="true" />
            <span>
              <span className={styles.brandExtra}>Gen 1 </span>Pokédex
            </span>
          </Link>
          <nav aria-label="Main">
            <ul className={styles.navList}>
              <li>
                <NavLink to="/" end className={navClass}>
                  List
                </NavLink>
              </li>
              <li>
                <NavLink to="/gallery" className={navClass}>
                  Gallery
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<ListView />} />
          <Route path="/gallery" element={<GalleryView />} />
          <Route path="/pokemon/:id" element={<DetailView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
