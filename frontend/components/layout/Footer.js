import styles from '../../styles/Footer.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../reducers/admin';
import { useRouter } from 'next/router';

function Footer() {
  const router = useRouter();
  const dispatch = useDispatch();

	const handleLogout = () => {
		dispatch(logout());
    router.push("/");
	};

  return (
    <div className={styles.footer}>
        <button onClick={()=>handleLogout()}
        className={styles.footerLogout}>Se déconnecter</button>
        <div className={styles.footerContent}>Copyright © 2025 CheckToPic Inc. Tous droits réservés</div>
    </div>  
  );
}

export default Footer;