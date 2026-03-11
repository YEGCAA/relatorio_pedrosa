import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, ArrowRight } from 'lucide-react';
import Logo from '../components/Logo';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(username, password);
    if (!result.success) {
      setError(result.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-sidebar">
          <div className="sidebar-content">
            <Logo size={80} color="white" textColor="white" layout="horizontal" />
            <div className="sidebar-text">
              <h1>Excelência na<br />Construção Civil.</h1>
              <p>O sistema integrado de gestão da Pedrosa Construtora de Salvador.</p>
            </div>
            <div className="sidebar-footer">
              <span className="dot"></span>
              <span>Qualidade em cada detalhe</span>
            </div>
          </div>
        </div>

        <div className="login-main">
          <div className="login-box animate-fade">
            <div className="mobile-logo">
              <Logo size={40} layout="horizontal" />
            </div>

            <header className="login-header">
              <h2>Acesse sua conta</h2>
              <p>Bem-vindo de volta! Entre com suas credenciais.</p>
            </header>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label>Usuário</label>
                <div className="input-field">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Seu nome de usuário"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Senha</label>
                <div className="input-field">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha secreta"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {error && (
                <div className="error-box">
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className="btn-primary login-btn" disabled={isLoading}>
                {isLoading ? 'Autenticando...' : (
                  <>
                    Acessar Dashboard
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <footer className="box-footer">
              <p>© 2026 Pedrosa Construtora - Salvador. Todos os direitos reservados.</p>
            </footer>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-wrapper {
          min-height: 100vh;
          background: #F4F7F6;
          display: flex;
        }

        .login-container {
          display: flex;
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
        }

        /* Sidebar Section */
        .login-sidebar {
          flex: 1.2;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          padding: 4rem;
          position: relative;
          overflow: hidden;
        }

        .login-sidebar::before {
          content: '';
          position: absolute;
          top: -20%;
          right: -20%;
          width: 60%;
          height: 60%;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
          filter: blur(80px);
        }

        .sidebar-content {
          max-width: 480px;
          position: relative;
          z-index: 1;
        }

        .sidebar-text h1 {
          font-size: 3.5rem;
          line-height: 1.1;
          margin: 2.5rem 0 1.5rem;
          font-weight: 800;
        }

        .sidebar-text p {
          font-size: 1.125rem;
          opacity: 0.8;
          font-weight: 400;
          max-width: 360px;
        }

        .sidebar-footer {
          margin-top: 4rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .dot {
          width: 8px;
          height: 8px;
          background: var(--success);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--success);
        }

        /* Main Form Section */
        .login-main {
          flex: 1;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .login-box {
          width: 100%;
          max-width: 420px;
        }

        .mobile-logo {
          display: none;
          margin-bottom: 2.5rem;
        }

        .login-header h2 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          color: var(--text-main);
        }

        .login-header p {
          color: var(--text-muted);
          margin-bottom: 2.5rem;
          font-size: 1rem;
        }

        .login-form .form-group {
          margin-bottom: 1.5rem;
        }

        .login-btn {
          width: 100%;
          margin-top: 2rem;
          padding: 1rem;
          font-size: 1rem;
          gap: 0.75rem;
        }

        .error-box {
          background: rgba(255, 59, 48, 0.08);
          color: var(--danger);
          padding: 1rem;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 600;
          text-align: center;
          margin-top: 1rem;
          border: 1px solid rgba(255, 59, 48, 0.2);
        }

        .box-footer {
          margin-top: 4rem;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.75rem;
        }

        @media (max-width: 1024px) {
          .login-sidebar { display: none; }
          .mobile-logo { display: block; }
          .login-main { background: #F4F7F6; }
          .login-box {
            background: white;
            padding: 3rem;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
          }
        }

        @media (max-width: 480px) {
          .login-box { padding: 2rem; }
        }
      `}</style>
    </div>
  );
};

export default Login;
