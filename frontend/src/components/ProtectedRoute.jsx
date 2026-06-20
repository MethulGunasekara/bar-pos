import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// 'children' represents whatever page is trying to be rendered inside this wrapper
const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { user } = useAuth();

    // 1. If there is no user logged in at all, kick them to the login screen
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // 2. If this specific route requires Admin privileges, and they are just a cashier...
    if (requireAdmin && user.role !== 'admin') {
        // Kick them back to the POS terminal, they aren't allowed in the back office!
        alert("Access Denied: Managers Only");
        return <Navigate to="/pos" replace />;
    }

    // 3. If they pass the checks, render the page they asked for!
    return children;
};

export default ProtectedRoute;