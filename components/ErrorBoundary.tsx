
import React, { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white p-6">
          <div className="w-full max-w-md text-center">
            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                <AlertCircle className="text-red-500" size={32} />
              </div>
            </div>
            <h1 className="text-3xl font-serif italic mb-4">Something went wrong</h1>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              An unexpected error occurred. We've been notified and are looking into it.
            </p>
            
            {this.state.error && (
              <div className="mb-8 p-4 bg-gray-50 rounded-sm text-left overflow-auto max-h-40">
                <p className="text-[10px] font-mono text-red-600">{this.state.error.toString()}</p>
              </div>
            )}

            <div className="space-y-4">
              <button 
                onClick={this.handleReset}
                className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors flex justify-center items-center gap-2"
              >
                <RefreshCw size={16} /> Reload Application
              </button>
              
              <button 
                onClick={() => window.location.href = '/'}
                className="w-full bg-white border border-gray-200 text-black py-4 text-xs font-bold uppercase tracking-[0.2em] hover:border-black transition-colors flex justify-center items-center gap-2"
              >
                <Home size={16} /> Back to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
