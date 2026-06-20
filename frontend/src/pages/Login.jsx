import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassWater, LogIn, TriangleAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        const result = await login(username, password);

        if (result.success) {
            const loggedInUser = JSON.parse(localStorage.getItem('pos_user'));
            if (loggedInUser.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/pos');
            }
        } else {
            setError(result.message);
            setSubmitting(false);
        }
    };

    return (
        <div className="login-screen">
            <div className="login-card">
                <div className="login-brand">
                    <span className="login-brand-icon">
                        <GlassWater size={22} strokeWidth={2.25} />
                    </span>
                    <span className="login-brand-name">BarTab</span>
                </div>

                <h1 className="login-title">Welcome back</h1>
                <p className="login-subtitle">Sign in to open the till</p>

                {error && (
                    <div className="login-error">
                        <TriangleAlert size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div>
                        <label className="field-label" htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            className="input"
                            placeholder="e.g. mia"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoFocus
                            required
                        />
                    </div>
                    <div>
                        <label className="field-label" htmlFor="password">PIN</label>
                        <input
                            id="password"
                            type="password"
                            className="input"
                            placeholder="••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary login-submit" disabled={submitting}>
                        {submitting ? 'Signing in…' : (<><LogIn size={17} /> Sign in</>)}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
