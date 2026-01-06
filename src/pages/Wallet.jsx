import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { walletAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Wallet.css';

const Wallet = () => {
    const { user, refreshUser } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [rechargeRequests, setRechargeRequests] = useState([]);
    const [withdrawRequests, setWithdrawRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [txRes, rechargeRes, withdrawRes] = await Promise.all([
                walletAPI.getTransactions(1),
                walletAPI.getRechargeStatus(),
                walletAPI.getWithdrawStatus()
            ]);
            setTransactions(txRes.data.transactions || []);
            setRechargeRequests(rechargeRes.data || []);
            setWithdrawRequests(withdrawRes.data || []);
        } catch (error) {
            // Silent error
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTypeBadge = (type) => {
        const badges = {
            deposit: <span className="badge badge-success">Deposit</span>,
            withdraw: <span className="badge badge-warning">Withdraw</span>,
            bet: <span className="badge badge-primary">Bet</span>,
            win: <span className="badge badge-success">Win</span>,
            refund: <span className="badge badge-primary">Refund</span>
        };
        return badges[type] || null;
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: <span className="badge badge-warning">Pending</span>,
            approved: <span className="badge badge-success">Approved</span>,
            rejected: <span className="badge badge-danger">Rejected</span>
        };
        return badges[status] || null;
    };

    if (loading) {
        return (
            <div className="wallet-loading">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="wallet-container">
            <div className="wallet-header">
                <h1 className="wallet-title">My Wallet</h1>
                <div className="wallet-balance-card">
                    <div className="balance-info">
                        <span className="balance-label">Available Balance</span>
                        <span className="balance-amount">₹{user?.balance?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="wallet-actions">
                        <Link to="/recharge" className="btn btn-primary">
                            Add Money
                        </Link>
                        <Link to="/withdraw" className="btn btn-secondary">
                            Withdraw
                        </Link>
                    </div>
                </div>
            </div>

            <div className="wallet-tabs">
                <button
                    className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Transactions
                </button>
                <button
                    className={`tab-btn ${activeTab === 'recharges' ? 'active' : ''}`}
                    onClick={() => setActiveTab('recharges')}
                >
                    Recharge History
                </button>
                <button
                    className={`tab-btn ${activeTab === 'withdrawals' ? 'active' : ''}`}
                    onClick={() => setActiveTab('withdrawals')}
                >
                    Withdrawal History
                </button>
            </div>

            <div className="wallet-content">
                {activeTab === 'overview' && (
                    <div className="transactions-list">
                        {transactions.length === 0 ? (
                            <div className="empty-state">
                                <p>No transactions yet</p>
                            </div>
                        ) : (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>Amount</th>
                                            <th>Balance</th>
                                            <th>Description</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((tx) => (
                                            <tr key={tx._id}>
                                                <td>{getTypeBadge(tx.type)}</td>
                                                <td className={tx.amount > 0 ? 'amount-positive' : 'amount-negative'}>
                                                    {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toFixed(2)}
                                                </td>
                                                <td>₹{tx.balanceAfter.toFixed(2)}</td>
                                                <td className="tx-desc">{tx.description}</td>
                                                <td className="tx-date">{formatDate(tx.createdAt)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'recharges' && (
                    <div className="requests-list">
                        {rechargeRequests.length === 0 ? (
                            <div className="empty-state">
                                <p>No recharge requests</p>
                                <Link to="/recharge" className="btn btn-primary btn-sm">Add Money</Link>
                            </div>
                        ) : (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Amount</th>
                                            <th>UTR Number</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rechargeRequests.map((req) => (
                                            <tr key={req._id}>
                                                <td className="amount-positive">₹{req.amount.toFixed(2)}</td>
                                                <td className="utr-number">{req.utrNumber}</td>
                                                <td>{getStatusBadge(req.status)}</td>
                                                <td className="tx-date">{formatDate(req.createdAt)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'withdrawals' && (
                    <div className="requests-list">
                        {withdrawRequests.length === 0 ? (
                            <div className="empty-state">
                                <p>No withdrawal requests</p>
                            </div>
                        ) : (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Amount</th>
                                            <th>UPI ID</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {withdrawRequests.map((req) => (
                                            <tr key={req._id}>
                                                <td className="amount-negative">-₹{req.amount.toFixed(2)}</td>
                                                <td className="upi-id">{req.upiId}</td>
                                                <td>{getStatusBadge(req.status)}</td>
                                                <td className="tx-date">{formatDate(req.createdAt)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wallet;
