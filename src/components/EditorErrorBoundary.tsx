'use client';

import React from 'react';
import { Sofa, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class EditorErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[EditorErrorBoundary] Three.js crash caught:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleReset = () => {
    // Clear potentially corrupted localStorage data
    try {
      localStorage.removeItem('instod_rooms');
      localStorage.removeItem('instod_room_states');
    } catch {}
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center" style={{ background: '#1A1612' }}>
          <div className="max-w-md w-full mx-4 p-8 rounded-2xl text-center" style={{ background: '#F5F0E8', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: '#FEF2F2' }}>
              <Sofa className="w-8 h-8" style={{ color: '#DC2626' }} />
            </div>
            
            {/* Title */}
            <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
              Something went wrong
            </h2>
            <p className="text-sm mb-6" style={{ color: '#5A4E42' }}>
              The 3D editor encountered an unexpected error. This is usually caused by a graphics driver issue or corrupted data. Try reloading or clearing your saved data.
            </p>

            {/* Error details (collapsible) */}
            {this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-xs font-medium cursor-pointer" style={{ color: '#5A4E42' }}>
                  Technical details
                </summary>
                <pre className="mt-2 p-3 rounded-lg text-[10px] overflow-auto max-h-32" style={{ background: '#FAF8F4', color: '#7A6E62', border: '1px solid #E2DDD4' }}>
                  {this.state.error.message}
                </pre>
              </details>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer border transition-all hover:opacity-90"
                style={{ borderColor: '#E2DDD4', color: '#5A4E42', background: '#FFFFFF' }}
              >
                <RotateCcw className="w-4 h-4" />
                Reload Editor
              </button>
              <Link
                href="/"
                className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)', color: '#fff' }}
              >
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            </div>

            {/* Reset data option */}
            <button
              onClick={this.handleReset}
              className="mt-4 text-xs underline cursor-pointer"
              style={{ color: '#5A4E42' }}
            >
              Clear saved data & reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
