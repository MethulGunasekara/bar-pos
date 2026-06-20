import { GlassWater, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Topbar.css';

const Topbar = ({ title, children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const initial = user?.username ? user.username.charAt(0).toUpperCase() : '?';

    return (
        <header className="topbar">
            <div className="topbar-brand">
                <span className="topbar-brand-icon">
                    <GlassWater size={16} strokeWidth={2.25} />
                </span>
                <span className="topbar-brand-name">BarTab</span>
                {title && <span className="topbar-title">{title}</span>}
            </div>

            <div className="topbar-actions">
                {children}

                {user && (
                    <div className="topbar-user">
                        <span className="topbar-avatar">{initial}</span>
                        <span className="topbar-username">{user.username}</span>
                        {user.role === 'admin' && <span className="badge badge-citrus">Admin</span>}
                    </div>
                )}

                <button className="icon-btn" onClick={handleLogout} aria-label="Log out" title="Log out">
                    <LogOut size={17} />
                </button>
            </div>
        </header>
    );
};

export default Topbar;
