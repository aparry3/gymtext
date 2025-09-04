"use client";
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  sectionName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ProfileErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Profile section error:', error, errorInfo);
    
    // You could send this to an error reporting service here
    // Example: reportError(error, { context: 'ProfileSection', sectionName: this.props.sectionName });
  }

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-5 w-5 text-red-500" aria-hidden="true">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-red-800">
              {this.props.sectionName ? `Error in ${this.props.sectionName}` : 'Section Error'}
            </h3>
          </div>
          <div className="text-sm text-red-700 mb-3">
            Something went wrong loading this section. The error has been logged and we&apos;re working to fix it.
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="text-xs px-3 py-1 bg-red-100 text-red-800 rounded-full hover:bg-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ProfileErrorBoundary;