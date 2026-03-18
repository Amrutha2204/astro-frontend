import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
};

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center font-[system-ui,sans-serif]">
          <h1 className="mb-2 text-[20px]">Something went wrong</h1>
          <p className="mb-4 text-[#6b7280]">We couldn’t load this page. Please try again.</p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="rounded-[8px] bg-[#6b4423] px-5 py-[10px] font-semibold text-white"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
