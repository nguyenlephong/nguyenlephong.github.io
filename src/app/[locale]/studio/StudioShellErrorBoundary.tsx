"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type StudioShellErrorCopy = {
  title: string;
  detail: string;
  reload: string;
};

type StudioShellErrorBoundaryProps = {
  children: ReactNode;
  copy: StudioShellErrorCopy;
  onError?: () => void;
};

type StudioShellErrorBoundaryState = { failed: boolean };

export function StudioDeferredShellFallback() {
  return (
    <>
      <slot name="studio-page-heading" />
      <slot name="studio-loading-fallback" />
    </>
  );
}

export default class StudioShellErrorBoundary extends Component<
  StudioShellErrorBoundaryProps,
  StudioShellErrorBoundaryState
> {
  override state: StudioShellErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): StudioShellErrorBoundaryState {
    return { failed: true };
  }

  override componentDidCatch(_error: Error, _info: ErrorInfo): void {
    this.props.onError?.();
  }

  private readonly reload = (): void => {
    window.location.reload();
  };

  override render() {
    if (!this.state.failed) return this.props.children;

    return (
      <>
        <slot name="studio-page-heading" />
        <section className="card empty-route" role="alert">
          <strong>{this.props.copy.title}</strong>
          <p>{this.props.copy.detail}</p>
          <button type="button" className="outline-button" onClick={this.reload}>
            {this.props.copy.reload}
          </button>
        </section>
        <slot name="studio-loading-fallback" />
      </>
    );
  }
}
