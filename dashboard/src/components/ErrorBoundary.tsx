import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="solid-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--accent-red)' }}>
          <AlertTriangle style={{ width: '2rem', height: '2rem', marginBottom: '0.5rem', opacity: 0.8 }} />
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem', fontFamily: 'var(--font-space)' }}>Component Crashed</h2>
          <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
