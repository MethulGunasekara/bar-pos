import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { TrendingUp, Receipt, Banknote, CreditCard, Settings, ArrowLeft, LoaderCircle, UserPlus, Users, Trash2 } from 'lucide-react';
import Topbar from '../components/Topbar';
import { formatMoney } from '../utils/format';
import './Admin.css';

const Admin = () => {
    // --- STATE ---
    const [reportData, setReportData] = useState({
        totalRevenue: 0,
        transactionCount: 0,
        breakdown: { cash: 0, card: 0 }
    });
    const [loading, setLoading] = useState(true);
    
    // New state for Staff Management
    const [cashiers, setCashiers] = useState([]);
    const [newCashier, setNewCashier] = useState({ username: '', password: '' });
    const [staffLoading, setStaffLoading] = useState(true);

    // --- DATA FETCHING ---
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch EOD Report
                const reportRes = await axios.get('http://localhost:5000/api/reports/daily');
                setReportData(reportRes.data);
                setLoading(false);

                // Fetch Cashiers
                const staffRes = await axios.get('http://localhost:5000/api/users/cashiers');
                setCashiers(staffRes.data);
                setStaffLoading(false);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setLoading(false);
                setStaffLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // --- STAFF ACTIONS ---
    const handleAddCashier = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/users/cashier', newCashier);
            if (res.status === 201) {
                alert('Cashier created successfully!');
                setCashiers([...cashiers, res.data]); // Add new cashier to the list instantly
                setNewCashier({ username: '', password: '' }); // Clear form
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating cashier');
        }
    };

    const handleDeleteCashier = async (id, username) => {
        if (window.confirm(`Are you sure you want to revoke POS access for ${username}?`)) {
            try {
                await axios.delete(`http://localhost:5000/api/users/${id}`);
                setCashiers(cashiers.filter(c => c._id !== id)); // Remove from list instantly
            } catch (error) {
                alert('Error deleting cashier');
            }
        }
    };

    return (
        <div className="admin-screen">
            <Topbar title="Dashboard">
                <Link to="/products" className="btn btn-sm btn-primary">
                    <Settings size={14} /> Manage menu
                </Link>
            </Topbar>

            <main className="admin-main" style={{ paddingBottom: '4rem' }}>
                
                {/* --- EOD REPORTING SECTION --- */}
                <div className="admin-heading">
                    <h1>End of day</h1>
                    <p>Today's sales summary, refreshed on load.</p>
                </div>

                {loading ? (
                    <div className="admin-loading">
                        <LoaderCircle size={22} className="spin" />
                        <span>Loading dashboard…</span>
                    </div>
                ) : (
                    <div className="kpi-grid">
                        <div className="kpi-card">
                            <div className="kpi-icon kpi-icon--citrus"><TrendingUp size={20} /></div>
                            <p className="kpi-label">Gross sales</p>
                            <p className="kpi-value price">{formatMoney(reportData.totalRevenue)}</p>
                        </div>

                        <div className="kpi-card">
                            <div className="kpi-icon kpi-icon--ink"><Receipt size={20} /></div>
                            <p className="kpi-label">Transactions</p>
                            <p className="kpi-value">{reportData.transactionCount}</p>
                        </div>

                        <div className="kpi-card kpi-card--lime">
                            <div className="kpi-icon kpi-icon--lime"><Banknote size={20} /></div>
                            <p className="kpi-label">Expected cash in drawer</p>
                            <p className="kpi-value price">{formatMoney(reportData.breakdown.cash)}</p>
                        </div>

                        <div className="kpi-card kpi-card--sky">
                            <div className="kpi-icon kpi-icon--sky"><CreditCard size={20} /></div>
                            <p className="kpi-label">Total card sales</p>
                            <p className="kpi-value price">{formatMoney(reportData.breakdown.card)}</p>
                        </div>
                    </div>
                )}

                {/* --- STAFF MANAGEMENT SECTION --- */}
                <div className="admin-heading" style={{ marginTop: '3rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Users size={24} /> Staff Management</h1>
                    <p>Add or revoke cashier access to the POS system.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '1.5rem' }}>
                    
                    {/* Add Cashier Form */}
                    <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><UserPlus size={18} /> Create New Cashier</h3>
                        <form onSubmit={handleAddCashier} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <input 
                                type="text" 
                                placeholder="Username (e.g. Cashier_A)" 
                                value={newCashier.username} 
                                onChange={(e) => setNewCashier({...newCashier, username: e.target.value})} 
                                required 
                                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                            />
                            <input 
                                type="password" 
                                placeholder="PIN / Password" 
                                value={newCashier.password} 
                                onChange={(e) => setNewCashier({...newCashier, password: e.target.value})} 
                                required 
                                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                            />
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
                                Add Cashier
                            </button>
                        </form>
                    </div>

                    {/* Active Cashiers List */}
                    <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Active Cashiers</h3>
                        {staffLoading ? (
                            <p>Loading staff...</p>
                        ) : cashiers.length === 0 ? (
                            <p style={{ color: '#888' }}>No cashiers found. Add one to get started.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {cashiers.map(c => (
                                    <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px', border: '1px solid #eee' }}>
                                        <span style={{ fontWeight: '500' }}>{c.username}</span>
                                        <button 
                                            onClick={() => handleDeleteCashier(c._id, c.username)}
                                            className="icon-btn order-remove" 
                                            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                            title="Revoke Access"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

            </main>
        </div>
    );
};

export default Admin;