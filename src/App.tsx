import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { LoadingState } from './components/LoadingState'
import { AuthProvider } from './contexts/AuthContext'

const HomePage = lazy(() => import('./pages/HomePage').then((module) => ({ default: module.HomePage })))
const LoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })))
const CadastroPage = lazy(() => import('./pages/CadastroPage').then((module) => ({ default: module.CadastroPage })))
const MapaPage = lazy(() => import('./pages/MapaPage').then((module) => ({ default: module.MapaPage })))
const RegistrosPage = lazy(() => import('./pages/RegistrosPage').then((module) => ({ default: module.RegistrosPage })))
const HistoriaPage = lazy(() => import('./pages/HistoriaPage').then((module) => ({ default: module.HistoriaPage })))
const NovoRegistroPage = lazy(() => import('./pages/NovoRegistroPage').then((module) => ({ default: module.NovoRegistroPage })))
const MenuPage = lazy(() => import('./pages/MenuPage').then((module) => ({ default: module.MenuPage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((module) => ({ default: module.ProfilePage })))
const FavoritesPage = lazy(() => import('./pages/FavoritesPage').then((module) => ({ default: module.FavoritesPage })))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then((module) => ({ default: module.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then((module) => ({ default: module.ResetPasswordPage })))

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<main className="app-page"><LoadingState label="Preparando a experiência…" /></main>}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/cadastro" element={<CadastroPage />} />
              <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
              <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
              <Route path="/mapa" element={<MapaPage />} />
              <Route path="/registros" element={<RegistrosPage />} />
              <Route path="/historias/:id" element={<HistoriaPage />} />
              <Route path="/novo-registro" element={<NovoRegistroPage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/perfil" element={<ProfilePage own />} />
              <Route path="/perfis/:id" element={<ProfilePage />} />
              <Route path="/favoritos" element={<FavoritesPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
