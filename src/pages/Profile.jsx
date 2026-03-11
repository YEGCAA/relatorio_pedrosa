import { useAuth } from '../context/AuthContext';
import { User, Shield, LogOut, Building, Mail, MapPin, Award } from 'lucide-react';
import Logo from '../components/Logo';

const Profile = () => {
  const { user, logout } = useAuth();

  return (
    <div className="profile-container animate-fade">
      <div className="profile-card card">
        <div className="profile-banner">
          <Logo size={50} color="white" textColor="white" className="banner-logo" />
        </div>

        <div className="profile-main">
          <div className="profile-avatar">
            {user?.name.charAt(0)}
          </div>

          <div className="profile-info">
            <h1>{user?.name}</h1>
            <div className="role-chip">
              <Award size={14} />
              <span>{user?.role === 'engineer' ? 'Engenheiro Residente' : 'Diretor Administrativo'}</span>
            </div>
            <p className="profile-bio">Responsável pela gestão de insumos e auditoria de notas fiscais técnica na Pedrosa Construtora.</p>
          </div>
        </div>

        <div className="profile-grid mt-4">
          <div className="profile-field">
            <div className="field-label">
              <User size={18} />
              <span>Nome de Usuário</span>
            </div>
            <div className="field-value">{user?.username}</div>
          </div>

          <div className="profile-field">
            <div className="field-label">
              <Building size={18} />
              <span>Unidade</span>
            </div>
            <div className="field-value">Unidade Salvador</div>
          </div>

          <div className="profile-field">
            <div className="field-label">
              <Shield size={18} />
              <span>Nível de Acesso</span>
            </div>
            <div className="field-value text-capitalize">{user?.cargoReal}</div>
          </div>

          <div className="profile-field">
            <div className="field-label">
              <MapPin size={18} />
              <span>Localização</span>
            </div>
            <div className="field-value">Salvador, BA</div>
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn-secondary logout-full" onClick={logout}>
            <LogOut size={20} />
            Encerrar Sessão Segura
          </button>
        </div>
      </div>

      <style jsx>{`
        .profile-container { max-width: 800px; margin: 0 auto; }
        .profile-card { padding: 0; overflow: hidden; position: relative; }
        
        .profile-banner {
          height: 160px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          display: flex;
          align-items: center;
          padding: 0 3rem;
        }

        .banner-logo {
          opacity: 0.9;
        }

        .profile-main {
          padding: 0 3rem;
          margin-top: -60px;
          display: flex;
          align-items: flex-end;
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .profile-avatar {
          width: 140px;
          height: 140px;
          background: white;
          color: var(--primary);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4rem;
          font-weight: 800;
          box-shadow: var(--shadow-lg);
          border: 6px solid white;
        }

        .profile-info { flex: 1; padding-bottom: 0.5rem; }
        .profile-info h1 { font-size: 2.25rem; margin-bottom: 0.5rem; }
        
        .role-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(193, 18, 31, 0.08);
          color: var(--primary);
          border-radius: var(--radius-full);
          font-size: 0.8125rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .profile-bio { color: var(--text-muted); font-size: 0.9375rem; max-width: 440px; }

        .profile-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
          padding: 0 3rem;
          margin-bottom: 3rem;
        }

        .profile-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        .field-label { display: flex; align-items: center; gap: 0.75rem; color: var(--text-muted); font-weight: 600; font-size: 0.8125rem; }
        .field-value { font-weight: 700; color: var(--text-main); font-size: 1.0625rem; }
        .text-capitalize { text-transform: capitalize; }

        .profile-actions { padding: 0 3rem 3rem; }
        .logout-full { width: 100%; height: 56px; color: var(--danger); border-color: rgba(255, 59, 48, 0.2); background: white; }
        .logout-full:hover { background: rgba(255, 59, 48, 0.05); }

        @media (max-width: 768px) {
          .profile-main { flex-direction: column; align-items: center; text-align: center; margin-top: -70px; }
          .profile-grid { grid-template-columns: 1fr; }
          .profile-avatar { width: 120px; height: 120px; font-size: 3rem; }
        }
      `}</style>
    </div>
  );
};

export default Profile;
