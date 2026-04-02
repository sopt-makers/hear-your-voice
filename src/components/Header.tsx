import { colors } from '@sopt-makers/colors';
import styles from './Header.module.css';
import headerImg from '../assets/header_img.png';

function Header() {
  return (
    <div className={styles.headerSection} style={{ backgroundColor: colors.secondary }}>
      <img src={headerImg} alt="안내사항" className={styles.headerImage} />
    </div>
  );
}

export default Header;
