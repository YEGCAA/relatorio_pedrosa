import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  User,
  LogOut,
  CheckCircle2,
  Menu,
  X,
  FileText,
  Bell,
  Wallet
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  // Menu dinâmico baseado no cargo
  const getMenuItems = () => {
    switch (user?.role) {
      case 'engineer':
        return [
          { title: 'Painel Geral', icon: <LayoutDashboard size={22} />, path: '/' },
          { title: 'Enviar Nota', icon: <PlusCircle size={22} />, path: '/enviar' },
          { title: 'Histórico', icon: <History size={22} />, path: '/historico' },
          { title: 'Meu Perfil', icon: <User size={22} />, path: '/perfil' },
        ];
      case 'analyst':
        return [
          { title: 'Painel Geral', icon: <LayoutDashboard size={22} />, path: '/' },
          { title: 'Aprovar Notas', icon: <CheckCircle2 size={22} />, path: '/aprovar' },
          { title: 'Histórico', icon: <History size={22} />, path: '/historico' },
          { title: 'Meu Perfil', icon: <User size={22} />, path: '/perfil' },
        ];
      case 'admin':
        return [
          { title: 'Painel Geral', icon: <LayoutDashboard size={22} />, path: '/' },
          { title: 'Fluxo de Caixa', icon: <Wallet size={22} />, path: '/fluxo' },
          { title: 'Histórico Geral', icon: <History size={22} />, path: '/historico' },
          { title: 'Meu Perfil', icon: <User size={22} />, path: '/perfil' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'expanded' : 'collapsed'}`}>
        <div className="sidebar-brand">
          <Logo size={isSidebarOpen ? 38 : 32} showText={isSidebarOpen} />
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item, idx) => (
            <Link
              key={idx}
              to={item.path}
              className={`menu-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <div className="link-icon">{item.icon}</div>
              {isSidebarOpen && <span className="link-text">{item.title}</span>}
              {location.pathname === item.path && <div className="active-indicator"></div>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={logout} className="logout-button">
            <div className="link-icon"><LogOut size={22} /></div>
            {isSidebarOpen && <span className="link-text">Sair do Sistema</span>}
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="main-viewport">
        <header className="navbar">
          <div className="navbar-left">
            <button className="icon-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="breadcrumb">
              <span className="bc-parent">Pedrosa Construtora - Salvador</span>
              <span className="bc-separator">/</span>
              <span className="bc-current">
                {menuItems.find(item => item.path === location.pathname)?.title || 'Sistema'}
              </span>
            </div>
          </div>

          <div className="navbar-right">
            <button className="icon-btn relative">
              <Bell size={20} />
              <span className="notification-dot"></span>
            </button>

            <div className="user-profile-trigger">
              <div className="user-meta">
                <span className="u-name">{user?.name}</span>
                <span className="u-role">{user?.cargoReal}</span>
              </div>
              <div className="u-avatar">
                {user?.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <main className="page-content animate-fade">
          {children}
        </main>
      </div>

      <style jsx>{`
        .app-shell {
          display: flex;
          min-height: 100vh;
          background: #F4F7F6;
        }
        .sidebar {
          background: white;
          border-right: 1px solid var(--border);
          transition: var(--transition);
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        
        .sidebar.expanded { width: 280px; }
        .sidebar.collapsed { width: 88px; }

        .sidebar-brand {
          padding: 2rem 1.5rem;
          display: flex;
          align-items: center;
          min-height: 100px;
        }

        .sidebar-menu {
          flex: 1;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .menu-link {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1rem;
          color: var(--text-muted);
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: 0.9375rem;
          position: relative;
          transition: var(--transition);
        }

        .menu-link:hover {
          background: #F4F7F6;
          color: var(--primary);
        }

        .menu-link.active {
          background: white;
          color: var(--primary);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border);
        }

        .active-indicator {
          position: absolute;
          left: 0;
          width: 4px;
          height: 24px;
          background: var(--primary);
          border-radius: 0 4px 4px 0;
        }

        .sidebar-footer {
          padding: 1.5rem 1rem;
          border-top: 1px solid var(--border);
        }

        .logout-button {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1rem;
          color: var(--danger);
          border-radius: var(--radius-md);
          font-weight: 600;
          transition: var(--transition);
        }

        .logout-button:hover {
          background: rgba(255, 59, 48, 0.05);
        }

        /* Viewport Styles */
        .main-viewport {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .navbar {
          height: 80px;
          background: white;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2.5rem;
          position: sticky;
          top: 0;
          z-index: 90;
        }


        .navbar-left {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.8125rem;
          font-weight: 600;
        }

        .bc-parent { color: var(--text-muted); }
        .bc-separator { color: var(--border); }
        .bc-current { color: var(--text-main); }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .icon-btn {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          color: var(--text-muted);
          border: 1.5px solid var(--border);
        }

        .icon-btn:hover {
          background: #F4F7F6;
          color: var(--text-main);
          border-color: var(--text-muted);
        }

        .notification-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background: var(--danger);
          border-radius: 50%;
          border: 2px solid white;
        }

        .user-profile-trigger {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding-left: 1.5rem;
          border-left: 1px solid var(--border);
        }

        .user-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .u-name {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .u-role {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .u-avatar {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          color: white;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.125rem;
          box-shadow: 0 4px 12px rgba(193, 18, 31, 0.15);
        }

        .page-content {
          padding: 2.5rem;
          flex: 1;
        }

        @media (max-width: 1024px) {
          .sidebar.expanded {
            position: fixed;
            height: 100vh;
            left: 0;
          }
          .sidebar.collapsed {
            width: 0;
            overflow: hidden;
            border: none;
          }
          .navbar { padding: 0 1.5rem; }
        }
      `}</style>
    </div>
  );
};

export default Layout;
