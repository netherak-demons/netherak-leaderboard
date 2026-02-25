'use client'

import React, { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div
          className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center"
          style={{ fontFamily: 'var(--font-harmonique)' }}
        >
          <p className="text-[#FF8C8A] text-base mb-2">Something went wrong</p>
          <p className="text-secondary/70 text-sm mb-4">
            Please refresh the page or try again later.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-primary hover:bg-white/10 transition-colors"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
