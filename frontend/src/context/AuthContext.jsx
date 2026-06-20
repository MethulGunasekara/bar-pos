import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // 1. When the app loads, check if we already have a saved session
    useEffect(() => {
        const storedUser = localStorage.getItem('pos_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // 2. The login function that talks to our Node.js backend
    const login = async (username, password) => {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', { username, password });
            
            if (response.data.token) {
                // Save to local storage so they survive a page refresh
                localStorage.setItem('pos_user', JSON.stringify(response.data));
                // Update our global React state
                setUser(response.data);
                return { success: true };
            }
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'Login failed' 
            };
        }
    };

    // 3. The logout function
    const logout = () => {
        localStorage.removeItem('pos_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};