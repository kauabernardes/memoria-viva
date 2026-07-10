export function LoadingState({ label = 'Carregando memórias…' }: { label?: string }) {
  return <div className="loading-state" role="status"><span className="loader" />{label}</div>
}
