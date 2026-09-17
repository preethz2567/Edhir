import React, { Component, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
            padding: '2rem',
          }}
        >
          <div
            className="card"
            style={{ maxWidth: 480, textAlign: 'center' }}
          >
            <p
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--text-1)',
                marginBottom: '0.375rem',
              }}
            >
              Something went wrong
            </p>
            <p
              style={{ fontSize: '0.75rem', color: 'var(--text-2)', marginBottom: '1.25rem' }}
            >
              {this.state.error?.message ?? 'An unexpected error occurred.'}
            </p>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => this.setState({ hasError: false, error: undefined })}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
