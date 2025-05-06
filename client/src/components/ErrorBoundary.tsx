'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, info);
    // Here you could log the error to an error reporting service
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-8">
            <div className="bg-red-100/10 h-24 w-24 rounded-full flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              We apologize for the inconvenience. The application encountered an unexpected error.
            </p>
            <details className="mb-4 bg-slate-900 p-4 rounded-md text-left">
              <summary className="cursor-pointer text-sm text-slate-300 mb-2">Error Details</summary>
              <p className="text-xs text-red-400 font-mono whitespace-pre-wrap">
                {this.state.error?.toString() || 'Unknown error'}
              </p>
            </details>
            <div className="flex gap-3 justify-center">
              <Button onClick={this.resetError}>Try Again</Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
