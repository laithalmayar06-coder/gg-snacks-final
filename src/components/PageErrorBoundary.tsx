import { Component, type ReactNode } from 'react'

export default class PageErrorBoundary extends Component<{ children: ReactNode; message: string; retry: string }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (this.state.failed) return <main className="route-loading"><p role="alert">{this.props.message}</p><button type="button" className="cta cta-secondary" onClick={() => window.location.reload()}>{this.props.retry}</button></main>
    return this.props.children
  }
}
