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
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center font-sans">
          <h1 className="text-xl mb-2">Something went wrong</h1>
          <p className="text-gray-500 mb-4">
            We couldn’t load this page. Please try again.
          </p>
          <button
  type="button"
  onClick={() => this.setState({ hasError: false })}
  className="px-5 py-2.5 bg-[#6b4423] text-white rounded-lg font-semibold cursor-pointer hover:opacity-90 transition"
>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
