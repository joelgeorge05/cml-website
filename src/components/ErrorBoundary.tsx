import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
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
    (this as any).setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', margin: '20px', border: '2px solid red', backgroundColor: '#fee', borderRadius: '10px', color: 'red' }}>
          <h2 style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '10px' }}>Application Error</h2>
          <p>Please copy this text or take a screenshot and send it to the developer:</p>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: '10px', padding: '10px', backgroundColor: 'white', border: '1px solid #ccc', overflowX: 'auto', fontSize: '12px' }}>
            {this.state.error && this.state.error.toString()}
            {'\n\n'}
            {this.state.errorInfo && (this.state.errorInfo as any).componentStack}
          </pre>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
