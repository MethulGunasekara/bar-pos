import { Banknote, CreditCard, X } from 'lucide-react';
import { formatMoney } from '../utils/format';
import './CheckoutModal.css';

const CheckoutModal = ({ isOpen, onClose, total, onPayment }) => {
    if (!isOpen) return null;

    return (
        <div className="checkout-overlay" onClick={onClose}>
            <div className="checkout-card" onClick={(e) => e.stopPropagation()}>
                <button className="icon-btn checkout-close" onClick={onClose} aria-label="Cancel">
                    <X size={18} />
                </button>

                <div className="checkout-perf" />

                <p className="checkout-label">Amount due</p>
                <h2 className="checkout-total">{formatMoney(total)}</h2>

                <div className="checkout-methods">
                    <button className="checkout-method checkout-method--cash" onClick={() => onPayment('Cash')}>
                        <Banknote size={32} strokeWidth={2} />
                        <span>Cash</span>
                    </button>
                    <button className="checkout-method checkout-method--card" onClick={() => onPayment('Card')}>
                        <CreditCard size={32} strokeWidth={2} />
                        <span>Card</span>
                    </button>
                </div>

                <button className="btn btn-ghost checkout-cancel" onClick={onClose}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default CheckoutModal;
