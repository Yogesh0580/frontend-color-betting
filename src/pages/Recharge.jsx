import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { walletAPI } from '../services/api';
import './Recharge.css';

const Recharge = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState('');
    const [utrNumber, setUtrNumber] = useState('');
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const quickAmounts = [100, 500, 1000, 2000, 5000];

    const handleAmountSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const amt = parseFloat(amount);
        if (!amt || amt < 100) {
            setError('Minimum recharge amount is ₹100');
            return;
        }

        setLoading(true);
        try {
            const response = await walletAPI.getPaymentDetails(amt);
            setPaymentDetails(response.data);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to get payment details');
        } finally {
            setLoading(false);
        }
    };

    const handleUtrSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!utrNumber || utrNumber.length < 10) {
            setError('Please enter a valid UTR number');
            return;
        }

        setLoading(true);
        try {
            await walletAPI.submitRecharge({
                amount: parseFloat(amount),
                utrNumber
            });
            setSuccess(true);
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit recharge');
        } finally {
            setLoading(false);
        }
    };

    const generateQRUrl = () => {
        if (!paymentDetails) return '';
        const { upiId, upiName, amount } = paymentDetails;
        return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amount}&cu=INR`;
    };

    return (
        <div className="recharge-container">
            <div className="recharge-card">
                <div className="recharge-header">
                    <h1 className="recharge-title">Add Money</h1>
                    <div className="steps-indicator">
                        <div className={`step ${step >= 1 ? 'active' : ''}`}>
                            <span className="step-number">1</span>
                            <span className="step-label">Amount</span>
                        </div>
                        <div className="step-line"></div>
                        <div className={`step ${step >= 2 ? 'active' : ''}`}>
                            <span className="step-number">2</span>
                            <span className="step-label">Pay</span>
                        </div>
                        <div className="step-line"></div>
                        <div className={`step ${step >= 3 ? 'active' : ''}`}>
                            <span className="step-number">3</span>
                            <span className="step-label">Confirm</span>
                        </div>
                    </div>
                </div>

                {error && <div className="recharge-error">{error}</div>}

                {step === 1 && (
                    <form onSubmit={handleAmountSubmit} className="recharge-form">
                        <div className="quick-amounts">
                            {quickAmounts.map((amt) => (
                                <button
                                    key={amt}
                                    type="button"
                                    className={`quick-btn ${amount === amt.toString() ? 'active' : ''}`}
                                    onClick={() => setAmount(amt.toString())}
                                >
                                    ₹{amt}
                                </button>
                            ))}
                        </div>

                        <div className="amount-input-group">
                            <span className="currency">₹</span>
                            <input
                                type="number"
                                className="amount-input"
                                placeholder="Enter amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min="100"
                                required
                            />
                        </div>

                        <p className="amount-note">Minimum: ₹100</p>

                        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                            {loading ? 'Loading...' : 'Continue'}
                        </button>
                    </form>
                )}

                {step === 2 && paymentDetails && (
                    <div className="payment-section">
                        <div className="qr-section">
                            <div className="qr-display">
                                {paymentDetails.qrCodeUrl ? (
                                    <img
                                        src={paymentDetails.qrCodeUrl}
                                        alt="Payment QR Code"
                                        className="qr-image"
                                    />
                                ) : (
                                    <div className="qr-placeholder">
                                        <span className="qr-icon">📱</span>
                                        <p>Use UPI ID below</p>
                                    </div>
                                )}
                            </div>

                            <div className="upi-details">
                                <div className="upi-row">
                                    <span className="upi-label">UPI ID</span>
                                    <span className="upi-value">{paymentDetails.upiId}</span>
                                </div>
                                <div className="upi-row">
                                    <span className="upi-label">Amount</span>
                                    <span className="upi-value amount">₹{paymentDetails.amount}</span>
                                </div>
                            </div>

                            <a href={generateQRUrl()} className="btn btn-secondary w-full">
                                Open in UPI App
                            </a>
                        </div>

                        <div className="utr-section">
                            <h3>Enter UTR Number</h3>
                            <p className="utr-info">
                                After payment, enter the 12-digit UTR/Reference number from your payment app
                            </p>

                            <form onSubmit={handleUtrSubmit}>
                                <input
                                    type="text"
                                    className="form-input utr-input"
                                    placeholder="Enter UTR number"
                                    value={utrNumber}
                                    onChange={(e) => setUtrNumber(e.target.value)}
                                    required
                                />

                                <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                                    {loading ? 'Submitting...' : 'Submit'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {step === 3 && success && (
                    <div className="success-section">
                        <div className="success-icon">✅</div>
                        <h2>Request Submitted!</h2>
                        <p>Your recharge request has been submitted successfully.</p>
                        <p className="success-note">
                            Your balance will be updated once the admin approves your request.
                        </p>
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={() => navigate('/wallet')}
                        >
                            Go to Wallet
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Recharge;
