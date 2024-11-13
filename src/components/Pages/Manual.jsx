import { FaDownload } from 'react-icons/fa';
import styles from '../styles/manual.module.css';
import LogoTaller from '../../assets/logobike.jpg';

export default function Manual() {
  const URL = import.meta.env.VITE_URL;

  const descargarManual = () => {
    window.open(`${URL}/manual`, '_blank');
  };

  return (
    <div className={styles.manualContainer}>
      <div className={styles.contentWrapper}>
        <img 
          src={LogoTaller} 
          alt="Logo de la empresa" 
          className={styles.logo}
        />
        <h1 className={styles.title}>Manual de Usuario</h1>
        <p className={styles.description}>
          Descargue nuestro manual de usuario para conocer todas las funcionalidades 
          del sistema de gestión para taller de bicicletas.
        </p>
        <button 
          onClick={descargarManual}
          className={styles.downloadButton}
        >
          <FaDownload className={styles.downloadIcon} />
          Descargar Manual
        </button>
      </div>
    </div>
  );
}