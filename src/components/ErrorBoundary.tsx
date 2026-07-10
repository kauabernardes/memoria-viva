import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryState { hasError: boolean }

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error('Erro de interface:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="error-page">
          <div className="brand-mark" aria-hidden="true">MV</div>
          <h1>Esta memória encontrou um obstáculo.</h1>
          <p>Recarregue a página para continuar. Seus dados locais foram preservados.</p>
          <button className="primary-button" onClick={() => window.location.reload()}>Recarregar</button>
        </main>
      )
    }
    return this.props.children
  }
}
