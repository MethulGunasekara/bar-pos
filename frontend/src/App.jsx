import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Import the actual pages we built!
import Login from './pages/Login';
import POS from './pages/POS';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute';
import ProductsAdmin from './pages/ProductsAdmin';

function App() {
  return (
    <Router>
      <Routes>
        {/* The Login page is public, anyone can see it */}
        <Route path="/" element={<Login />} />
        
        {/* The POS requires ANY logged-in user */}
        <Route 
            path="/pos" 
            element={
                <ProtectedRoute>
                    <POS />
                </ProtectedRoute>
            } 
        />
        
        {/* The Admin page requires a logged-in ADMIN */}
        <Route 
            path="/admin" 
            element={
                <ProtectedRoute requireAdmin={true}>
                    <Admin />
                </ProtectedRoute>
            } 
        />
        <Route 
            path="/products" 
            element={
                <ProtectedRoute requireAdmin={true}>
                    <ProductsAdmin />
                </ProtectedRoute>
            } 
        />
      </Routes>
    </Router>
  );
}

export default App;