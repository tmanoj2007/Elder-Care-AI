import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.hash = '';
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 text-slate-900">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border-2 border-rose-300 space-y-6 text-center animate-fade-in">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-200">
              <AlertTriangle className="w-10 h-10 stroke-[2.2]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">App Recovered Safely</h2>
              <p className="text-sm font-bold text-slate-600">
                An unexpected interface error occurred, but ElderCare AI has safely prevented a system crash.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 text-left overflow-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-black py-3.5 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-base"
            >
              <RefreshCw className="w-5 h-5 stroke-[2.5]" />
              <span>Resume Session Safely</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
