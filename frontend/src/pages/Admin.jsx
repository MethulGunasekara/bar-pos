import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Admin = () => {
    const [reportData, setReportData] = useState({
        totalRevenue: 0,
        transactionCount: 0,
        breakdown: { cash: 0, card: 0 }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/reports/daily');
                setReportData(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching EOD report:', error);
                setLoading(false);
            }
        };

        fetchReport();
    }, []); 

    if (loading) return <h2 style={{ textAlign: 'center', marginTop: '2rem' }}>Loading Dashboard...</h2>;

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h1 style={{ borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>End of Day (EOD) Dashboard</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                <div style={{ padding: '2rem', backgroundColor: '#f4f4f4', borderRadius: '8px', textAlign: 'center' }}>
                    <h2>Gross Sales</h2>
                    <p style={{ fontSize: '3rem', margin: '10px 0', color: '#4CAF50', fontWeight: 'bold' }}>
                        ${reportData.totalRevenue.toFixed(2)}
                    </p>
                </div>
                
                <div style={{ padding: '2rem', backgroundColor: '#f4f4f4', borderRadius: '8px', textAlign: 'center' }}>
                    <h2>Total Transactions</h2>
                    <p style={{ fontSize: '3rem', margin: '10px 0', fontWeight: 'bold' }}>
                        {reportData.transactionCount}
                    </p>
                </div>
                
                <div style={{ padding: '2rem', backgroundColor: '#e8f5e9', borderRadius: '8px', textAlign: 'center', border: '1px solid #4CAF50' }}>
                    <h2>Expected Cash in Drawer</h2>
                    <p style={{ fontSize: '2.5rem', margin: '10px 0' }}>
                        ${reportData.breakdown.cash.toFixed(2)}
                    </p>
                </div>
                
                <div style={{ padding: '2rem', backgroundColor: '#e3f2fd', borderRadius: '8px', textAlign: 'center', border: '1px solid #2196F3' }}>
                    <h2>Total Card Sales</h2>
                    <p style={{ fontSize: '2.5rem', margin: '10px 0' }}>
                        ${reportData.breakdown.card.toFixed(2)}
                    </p>
                </div>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ textAlign: 'center', marginTop: '3rem', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                
                <Link to="/pos" style={{ textDecoration: 'none', color: '#fff', backgroundColor: '#333', padding: '15px 30px', borderRadius: '5px', fontSize: '1.2rem' }}>
                    ← Back to POS Terminal
                </Link>

                {/* NEW BUTTON: Links directly to the Products Manager */}
                <Link to="/products" style={{ textDecoration: 'none', color: '#fff', backgroundColor: '#ff9800', padding: '15px 30px', borderRadius: '5px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    ⚙️ Manage Menu Products
                </Link>
                
            </div>
        </div>
    );
};

export default Admin;