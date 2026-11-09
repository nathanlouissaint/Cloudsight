import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface RouteErrorBoundaryProps {
  children: ReactNode;
}

interface RouteErrorBoundaryState {
  hasError: boolean;
}

export class RouteErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  state: RouteErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): RouteErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Unable to render the requested page.", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main role="alert">
          <h1>We couldn’t load this page.</h1>
          <p>Please refresh the page or return to the CloudSight homepage.</p>
          <a href="/">Go to homepage</a>
        </main>
      );
    }

    return this.props.children;
  }
}
