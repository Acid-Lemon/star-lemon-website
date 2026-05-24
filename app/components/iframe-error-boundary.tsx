'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class IframeErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  private handleError = (event: ErrorEvent) => {
    // Suppress errors originating from external iframes (douyin, bilibili, etc.)
    const origin = event.filename || '';
    if (
      origin.includes('open-douyin.com') ||
      origin.includes('douyin.com') ||
      origin.includes('bilibili.com') ||
      origin.includes('lf-developer-cdn')
    ) {
      event.preventDefault();
    }
  };

  componentDidMount() {
    window.addEventListener('error', this.handleError, true);
  }

  componentWillUnmount() {
    window.removeEventListener('error', this.handleError, true);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}