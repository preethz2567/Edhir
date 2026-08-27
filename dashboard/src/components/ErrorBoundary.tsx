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
        <div className="p-4 rounded-lg bg-red-900/20 border border-red-500/50 text-red-200 flex flex-col items-center justify-center text-center">
          <AlertTriangle className="w-8 h-8 mb-2 text-red-500" />
          <h2 className="text-lg font-semibold mb-1">Component Crashed</h2>
          <p className="text-sm opacity-80">{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
