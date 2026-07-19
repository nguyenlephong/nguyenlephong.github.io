"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type StudioFeatureErrorBoundaryProps = {
  children: ReactNode;
  onError?: () => void;
  onRetry: () => void;
  renderFallback: (retry: () => void) => ReactNode;
};

type StudioFeatureErrorBoundaryState = {
  failed: boolean;
};

export default class StudioFeatureErrorBoundary extends Component<
  StudioFeatureErrorBoundaryProps,
  StudioFeatureErrorBoundaryState
> {
  override state: StudioFeatureErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): Partial<StudioFeatureErrorBoundaryState> {
    return { failed: true };
  }

  override componentDidCatch(_error: Error, _info: ErrorInfo): void {
    this.props.onError?.();
  }

  private readonly retry = (): void => {
    this.props.onRetry();
  };

  override render() {
    if (this.state.failed) return this.props.renderFallback(this.retry);
    return this.props.children;
  }
}
