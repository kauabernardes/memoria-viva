declare global {
  interface Window {
    AppInventor?: { setWebViewString: (value: string) => void }
  }
}

export function sendAppInventorEvent(event: string) {
  try {
    window.AppInventor?.setWebViewString(event)
  } catch {
    // A ponte é opcional; falhas nunca devem interromper a SPA.
  }
}
