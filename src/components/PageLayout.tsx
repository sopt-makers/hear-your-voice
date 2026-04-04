import type { ReactNode } from 'react';
import React from 'react';
import styles from './PageLayout.module.css';

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
