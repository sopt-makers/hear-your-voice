import type { ReactNode } from 'react';
import * as styles from './ContentHeading.css';

interface ContentHeadingProps {
  title: string;
  description?: ReactNode;
  className?: string;
}

function ContentHeading({ title, description, className }: ContentHeadingProps) {
  return (
    <div className={`${styles.container} ${className ?? ''}`.trim()}>
      <h1 className={styles.title}>{title}</h1>
      {description != null && <div className={styles.description}>{description}</div>}
    </div>
  );
}

export default ContentHeading;
