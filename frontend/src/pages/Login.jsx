import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    // 1. Grab our navigation tool and our global login function
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear any old errors

        // 1. Pass the credentials to our AuthContext
        const result = await login(username, password);

        if (result.success) {
            // 2. Grab the user data that was just saved to local storage
            const loggedInUser = JSON.parse(localStorage.getItem('pos_user'));

            // 3. Check their role and route them accordingly!
            if (loggedInUser.role === 'admin') {
                navigate('/admin'); // Managers go to the back office
            } else {
                navigate('/pos');   // Cashiers go to the terminal
            }
        } else {
            // 4. If the backend says "invalid credentials", show the error
            setError(result.message);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10vh' }}>
            <h1>Local Bar POS</h1>
            
            {/* Display error messages if login fails */}
            {error && <div style={{ backgroundColor: '#ffebee', color: 'red', padding: '10px', borderRadius: '5px', marginBottom: '10px', width: '300px', textAlign: 'center', border: '1px solid red' }}>{error}</div>}
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
                <input 
                    type="text" 
                    placeholder="Username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ padding: '10px', fontSize: '1.2rem' }}
                    required
                />
                <input 
                    type="password" 
                    placeholder="Password (PIN)" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ padding: '10px', fontSize: '1.2rem' }}
                    required
                />
                <button type="submit" style={{ padding: '10px', fontSize: '1.2rem', cursor: 'pointer', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '5px' }}>
                    Login
                </button>
            </form>
        </div>
    );
};

export default Login;