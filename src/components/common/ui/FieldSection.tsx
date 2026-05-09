import type { ReactNode } from 'react';
import * as styles from './FieldSection.css';

interface FieldSectionProps {
  children: ReactNode;
}

function FieldSection({ children }: FieldSectionProps) {
  return <div className={styles.container}>{children}</div>;
}

export default FieldSection;
