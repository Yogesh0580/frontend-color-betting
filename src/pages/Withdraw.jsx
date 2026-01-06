import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { walletAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Withdraw.css';

const Withdraw = () => {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();
    const [amount, setAmount] = useState('');
    const [upiId, setUpiId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const amt = parseFloat(amount);
        if (!amt || amt < 100) {
            setError('Minimum withdrawal amount is ₹100');
            return;
        }

        if (amt > user.balance) {
            setError('Insufficient balance');
            return;
        }

        if (!upiId || !upiId.includes('@')) {
            setError('Please enter a valid UPI ID');
            return;
        }

        setLoading(true);
        try {
            await walletAPI.requestWithdraw({ amount: amt, upiId });
            setSuccess(true);
            refreshUser();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit withdrawal');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="withdraw-container">
                <div className="withdraw-card">
                    <div className="success-section">
                        <div className="success-icon">✅</div>
                        <h2>Request Submitted!</h2>
                        <p>Your withdrawal request has been submitted.</p>
                        <p className="success-note">
                            The amount will be transferred to your UPI ID once approved by admin.
                        </p>
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={() => navigate('/wallet')}
                        >
                            Go to Wallet
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="withdraw-container">
            <div className="withdraw-card">
                <h1 className="withdraw-title">Withdraw Funds</h1>

                <div className="balance-display">
                    <span className="balance-label">Available Balance</span>
                    <span className="balance-value">₹{user?.balance?.toFixed(2) || '0.00'}</span>
                </div>

                {error && <div className="withdraw-error">{error}</div>}

                <form onSubmit={handleSubmit} className="withdraw-form">
                    <div className="form-group">
                        <label className="form-label">Withdrawal Amount</label>
                        <div className="amount-input-group">
                            <span className="currency">₹</span>
                            <input
                                type="number"
                                className="amount-input"
                                placeholder="Enter amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min="100"
                                max={user?.balance}
                                required
                            />
                        </div>
                        <p className="input-note">Minimum: ₹100</p>
                    </div>

                    <div className="form-group">
                        <label className="form-label">UPI ID</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="yourname@paytm"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            required
                        />
                        <p className="input-note">Enter your UPI ID where you want to receive payment</p>
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                        {loading ? 'Submitting...' : 'Request Withdrawal'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Withdraw;
