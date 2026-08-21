import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("System Fault intercepted:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full py-12 px-6 border border-rose-200 bg-rose-50/20 font-mono text-xs text-rose-700 uppercase">
          [ CRITICAL SYSTEM FAULT: DATA INTERRUPTED. RE-INITIALISING NODE... ]
        </div>
      );
    }
    return this.props.children;
  }
}
