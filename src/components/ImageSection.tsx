import type { ReactNode } from 'react';
import * as styles from './ImageSection.css';

interface ImageSectionProps {
  children: ReactNode;
}

function ImageSection({ children }: ImageSectionProps) {
  return <div className={styles.container}>{children}</div>;
}

ImageSection.Image = function ImageSectionImage({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} className={styles.image} />;
};

export default ImageSection;
