import React from 'react';
import { useAuth } from './AuthContext';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

export default function ProtectedContent({ children }) {
  const { isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className={styles.lockOverlay}>
        <div className={styles.lockBox}>
          <h2>🔒 Contenido privado</h2>
          <p>
            Este contenido es exclusivo para alumnos inscritos.
            Ingresá la contraseña para acceder.
          </p>
          <Link to="/login" className="button button--primary">
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.authBar}>
        <span>✅ Autenticado</span>
        <button onClick={logout} className="button button--sm button--secondary">
          Cerrar sesión
        </button>
      </div>
      {children}
    </>
  );
}
