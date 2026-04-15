import type { ReactNode } from 'react';
import React from 'react';
import * as styles from './PageLayout.css';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function PageLayout({ children, className, style }: PageLayoutProps) {
  return (
    <div className={`${styles.container}${className ? ` ${className}` : ''}`} style={style}>
      {children}
    </div>
  );
}

export default PageLayout;
