import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@site/plugins/docusaurus-auth/theme/AuthContext';
import { useHistory } from '@docusaurus/router';
import Layout from '@theme/Layout';
import styles from '@site/plugins/docusaurus-auth/theme/styles.module.css';

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const history = useHistory();

  useEffect(() => {
    if (isAuthenticated) {
      history.replace('/');
    }
  }, [isAuthenticated, history]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const storedHash = (window as any).__AUTH_PASSWORD_HASH__;
    if (!storedHash) {
      setError('Error de configuración. Contactá al instructor.');
      setLoading(false);
      return;
    }

    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (hash === storedHash) {
      const exp = Date.now() + 24 * 60 * 60 * 1000;
      const token = btoa(JSON.stringify({ hash, exp }));
      localStorage.setItem('sasf_auth_token', token);
      window.location.reload();
    } else {
      setError('Contraseña incorrecta');
      setPassword('');
      inputRef.current?.focus();
    }
    setLoading(false);
  }

  if (isAuthenticated) return null;

  return (
    <Layout title="Iniciar sesión" description="Acceso al contenido privado de SASF Temarios">
      <main className={styles.lockOverlay}>
        <form onSubmit={handleSubmit} className={styles.lockBox} style={{ textAlign: 'left' }}>
          <h2 style={{ textAlign: 'center' }}>🔒 Contenido privado</h2>
          <p style={{ textAlign: 'center', color: 'var(--ifm-color-emphasis-600)' }}>
            Este contenido es exclusivo para alumnos de SASF.
          </p>

          <label htmlFor="password" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
            Contraseña
          </label>
          <input
            ref={inputRef}
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Ingresá la contraseña del curso"
            className="input"
            style={{
              width: '100%',
              padding: '0.625rem 0.75rem',
              fontSize: '1rem',
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: '6px',
              marginBottom: error ? '0.5rem' : '1rem',
            }}
          />

          {error && (
            <p style={{ color: 'var(--ifm-color-danger)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="button button--primary"
            style={{ width: '100%' }}
          >
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>
      </main>
    </Layout>
  );
}
