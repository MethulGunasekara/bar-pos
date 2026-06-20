// We add onPayment to our destructured props here
const CheckoutModal = ({ isOpen, onClose, total, onPayment }) => {
    if (!isOpen) return null; 

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '10px', width: '500px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '3rem', margin: '0 0 20px 0' }}>Total: ${total.toFixed(2)}</h2>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {/* We attach the function here, passing 'Cash' as the paymentMethod */}
                    <button 
                        onClick={() => onPayment('Cash')}
                        style={{ flex: 1, height: '150px', fontSize: '2.5rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
                    >
                        CASH
                    </button>
                    {/* We attach the function here, passing 'Card' as the paymentMethod */}
                    <button 
                        onClick={() => onPayment('Card')}
                        style={{ flex: 1, height: '150px', fontSize: '2.5rem', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
                    >
                        CARD
                    </button>
                </div>

                <button onClick={onClose} style={{ marginTop: '2rem', padding: '15px 30px', fontSize: '1.2rem', cursor: 'pointer' }}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default CheckoutModal;