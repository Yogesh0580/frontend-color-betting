import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import './Admin.css';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('live');
    const [dashboard, setDashboard] = useState(null);
    const [recharges, setRecharges] = useState([]);
    const [withdrawals, setWithdrawals] = useState([]);
    const [users, setUsers] = useState([]);
    const [settings, setSettings] = useState({ upiId: '', upiName: '', qrCodeUrl: '' });
    const [liveBets, setLiveBets] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    // Auto-refresh live bets every 2 seconds
    useEffect(() => {
        let interval;
        if (activeTab === 'live') {
            interval = setInterval(() => {
                fetchLiveBets();
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        setMessage('');
        try {
            if (activeTab === 'live') {
                await fetchLiveBets();
            } else if (activeTab === 'dashboard') {
                const res = await adminAPI.getDashboard();
                setDashboard(res.data);
            } else if (activeTab === 'recharges') {
                const res = await adminAPI.getRecharges('pending');
                setRecharges(res.data.requests || []);
            } else if (activeTab === 'withdrawals') {
                const res = await adminAPI.getWithdrawals('pending');
                setWithdrawals(res.data.requests || []);
            } else if (activeTab === 'users') {
                const res = await adminAPI.getUsers();
                setUsers(res.data.users || []);
            } else if (activeTab === 'settings') {
                const res = await adminAPI.getPaymentSettings();
                setSettings(res.data);
            }
        } catch (error) {
            // Silent error
        } finally {
            setLoading(false);
        }
    };

    const fetchLiveBets = async () => {
        try {
            const res = await adminAPI.getLiveBets();
            setLiveBets(res.data);
        } catch (error) {
            setLiveBets(null);
        }
    };

    const handleSetResult = async (color) => {
        try {
            await adminAPI.setResult(color);
            setMessage(`Result set to ${color.toUpperCase()}!`);
            fetchLiveBets();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to set result');
        }
    };

    const handleClearResult = async () => {
        try {
            await adminAPI.clearResult();
            setMessage('Manual result cleared. Will auto-generate.');
            fetchLiveBets();
        } catch (error) {
            setMessage('Failed to clear result');
        }
    };

    const handleApproveRecharge = async (id) => {
        try {
            await adminAPI.approveRecharge(id);
            fetchData();
        } catch (error) {
            // Silent error
        }
    };

    const handleRejectRecharge = async (id) => {
        try {
            await adminAPI.rejectRecharge(id);
            fetchData();
        } catch (error) {
            // Silent error
        }
    };

    const handleApproveWithdrawal = async (id) => {
        try {
            await adminAPI.approveWithdrawal(id);
            fetchData();
        } catch (error) {
            // Silent error
        }
    };

    const handleRejectWithdrawal = async (id) => {
        try {
            await adminAPI.rejectWithdrawal(id);
            fetchData();
        } catch (error) {
            // Silent error
        }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            await adminAPI.updatePaymentSettings(settings);
            setMessage('Settings saved successfully!');
        } catch (error) {
            setMessage('Failed to save settings');
        } finally {
            setSaving(false);
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

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1 className="admin-title">Admin Panel</h1>
            </div>

            <div className="admin-tabs">
                <button
                    className={`tab-btn ${activeTab === 'live' ? 'active' : ''}`}
                    onClick={() => setActiveTab('live')}
                >
                    🎮 Live Game
                </button>
                <button
                    className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    Dashboard
                </button>
                <button
                    className={`tab-btn ${activeTab === 'recharges' ? 'active' : ''}`}
                    onClick={() => setActiveTab('recharges')}
                >
                    Recharges
                </button>
                <button
                    className={`tab-btn ${activeTab === 'withdrawals' ? 'active' : ''}`}
                    onClick={() => setActiveTab('withdrawals')}
                >
                    Withdrawals
                </button>
                <button
                    className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    Users
                </button>
                <button
                    className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    ⚙️ Settings
                </button>
            </div>

            <div className="admin-content">
                {loading && activeTab !== 'live' ? (
                    <div className="admin-loading">
                        <div className="loading-spinner"></div>
                    </div>
                ) : (
                    <>
                        {/* Live Game Control */}
                        {activeTab === 'live' && (
                            <div className="live-game-section">
                                <h2>🎮 Live Game Control</h2>

                                {message && (
                                    <div className={`live-message ${message.includes('set') || message.includes('saved') ? 'success' : ''}`}>
                                        {message}
                                    </div>
                                )}

                                {liveBets ? (
                                    <>
                                        <div className="live-info">
                                            <div className="live-period">
                                                <span className="label">Current Period</span>
                                                <span className="value">{liveBets.gameId}</span>
                                            </div>
                                            <div className="live-timer">
                                                <span className={`timer-display ${liveBets.remainingTime <= 10 ? 'closed' : ''}`}>
                                                    {String(Math.floor(liveBets.remainingTime / 60)).padStart(2, '0')}:
                                                    {String(liveBets.remainingTime % 60).padStart(2, '0')}
                                                </span>
                                                <span className={`timer-status ${liveBets.isBettingOpen ? 'open' : 'closed'}`}>
                                                    {liveBets.isBettingOpen ? '🟢 Betting Open (50s)' : '🔴 Closed (10s)'}
                                                </span>
                                            </div>
                                            <div className="live-status">
                                                <span className={`status-badge ${liveBets.status}`}>
                                                    {liveBets.status === 'betting' ? 'Active' :
                                                        liveBets.status === 'closed' ? 'Closing' :
                                                            'Completed'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="bet-stats-grid">
                                            <div className="bet-stat-card red">
                                                <div className="color-icon">🔴</div>
                                                <div className="color-name">RED</div>
                                                <div className="bet-count">{liveBets.red.count} bets</div>
                                                <div className="bet-amount">₹{liveBets.red.amount}</div>
                                            </div>
                                            <div className="bet-stat-card green">
                                                <div className="color-icon">🟢</div>
                                                <div className="color-name">GREEN</div>
                                                <div className="bet-count">{liveBets.green.count} bets</div>
                                                <div className="bet-amount">₹{liveBets.green.amount}</div>
                                            </div>
                                            <div className="bet-stat-card violet">
                                                <div className="color-icon">🟣</div>
                                                <div className="color-name">VIOLET</div>
                                                <div className="bet-count">{liveBets.violet.count} bets</div>
                                                <div className="bet-amount">₹{liveBets.violet.amount}</div>
                                            </div>
                                        </div>

                                        <div className="total-stats">
                                            <span>Total: {liveBets.total.count} bets</span>
                                            <span>Amount: ₹{liveBets.total.amount}</span>
                                        </div>

                                        <div className="result-control">
                                            <h3>Set Result (Manual)</h3>
                                            <p className="result-note">
                                                {liveBets.manualResultSet
                                                    ? `✅ Manual result set: ${liveBets.manualResultSet.toUpperCase()}`
                                                    : '⚡ No manual result set - will auto-generate'}
                                            </p>
                                            <div className="result-buttons">
                                                <button
                                                    className={`result-btn red ${liveBets.manualResultSet === 'red' ? 'active' : ''}`}
                                                    onClick={() => handleSetResult('red')}
                                                >
                                                    🔴 Red (2x)
                                                </button>
                                                <button
                                                    className={`result-btn green ${liveBets.manualResultSet === 'green' ? 'active' : ''}`}
                                                    onClick={() => handleSetResult('green')}
                                                >
                                                    🟢 Green (2x)
                                                </button>
                                                <button
                                                    className={`result-btn violet ${liveBets.manualResultSet === 'violet' ? 'active' : ''}`}
                                                    onClick={() => handleSetResult('violet')}
                                                >
                                                    🟣 Violet (4.5x)
                                                </button>
                                            </div>
                                            {liveBets.manualResultSet && (
                                                <button className="btn btn-secondary clear-btn" onClick={handleClearResult}>
                                                    Clear Manual Result
                                                </button>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="empty-state">No active game</div>
                                )}
                            </div>
                        )}

                        {activeTab === 'dashboard' && dashboard && (
                            <div className="dashboard-grid">
                                <div className="stat-card">
                                    <span className="stat-value">{dashboard.totalUsers}</span>
                                    <span className="stat-label">Total Users</span>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-value">{dashboard.totalGames}</span>
                                    <span className="stat-label">Total Games</span>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-value">{dashboard.totalBets}</span>
                                    <span className="stat-label">Total Bets</span>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-value">₹{dashboard.totalBetAmount?.toFixed(0) || 0}</span>
                                    <span className="stat-label">Bet Amount</span>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-value">₹{dashboard.totalPayout?.toFixed(0) || 0}</span>
                                    <span className="stat-label">Payout</span>
                                </div>
                                <div className="stat-card stat-profit">
                                    <span className="stat-value">₹{dashboard.profit?.toFixed(0) || 0}</span>
                                    <span className="stat-label">Profit</span>
                                </div>
                                <div className="stat-card stat-pending">
                                    <span className="stat-value">{dashboard.pendingRecharges}</span>
                                    <span className="stat-label">Pending Recharges</span>
                                </div>
                                <div className="stat-card stat-pending">
                                    <span className="stat-value">{dashboard.pendingWithdrawals}</span>
                                    <span className="stat-label">Pending Withdrawals</span>
                                </div>
                            </div>
                        )}

                        {activeTab === 'recharges' && (
                            <div className="requests-section">
                                <h2>Pending Recharge Requests</h2>
                                {recharges.length === 0 ? (
                                    <div className="empty-state">No pending requests</div>
                                ) : (
                                    <div className="table-container">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>User</th>
                                                    <th>Amount</th>
                                                    <th>UTR</th>
                                                    <th>Date</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recharges.map((req) => (
                                                    <tr key={req._id}>
                                                        <td>
                                                            <div className="user-cell">
                                                                <span>{req.userId?.username}</span>
                                                                <small>{req.userId?.email}</small>
                                                            </div>
                                                        </td>
                                                        <td className="amount">₹{req.amount}</td>
                                                        <td className="utr">{req.utrNumber}</td>
                                                        <td className="date">{formatDate(req.createdAt)}</td>
                                                        <td className="actions">
                                                            <button
                                                                className="btn btn-success btn-sm"
                                                                onClick={() => handleApproveRecharge(req._id)}
                                                            >
                                                                ✓
                                                            </button>
                                                            <button
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => handleRejectRecharge(req._id)}
                                                            >
                                                                ✗
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'withdrawals' && (
                            <div className="requests-section">
                                <h2>Pending Withdrawal Requests</h2>
                                {withdrawals.length === 0 ? (
                                    <div className="empty-state">No pending requests</div>
                                ) : (
                                    <div className="table-container">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>User</th>
                                                    <th>Amount</th>
                                                    <th>UPI ID</th>
                                                    <th>Date</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {withdrawals.map((req) => (
                                                    <tr key={req._id}>
                                                        <td>
                                                            <div className="user-cell">
                                                                <span>{req.userId?.username}</span>
                                                                <small>{req.userId?.email}</small>
                                                            </div>
                                                        </td>
                                                        <td className="amount">₹{req.amount}</td>
                                                        <td className="upi">{req.upiId}</td>
                                                        <td className="date">{formatDate(req.createdAt)}</td>
                                                        <td className="actions">
                                                            <button
                                                                className="btn btn-success btn-sm"
                                                                onClick={() => handleApproveWithdrawal(req._id)}
                                                            >
                                                                Paid
                                                            </button>
                                                            <button
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => handleRejectWithdrawal(req._id)}
                                                            >
                                                                ✗
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className="users-section">
                                <h2>All Users</h2>
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Username</th>
                                                <th>Email</th>
                                                <th>Balance</th>
                                                <th>Status</th>
                                                <th>Joined</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user) => (
                                                <tr key={user._id}>
                                                    <td>{user.username}</td>
                                                    <td>{user.email}</td>
                                                    <td className="balance">₹{user.balance?.toFixed(0)}</td>
                                                    <td>
                                                        <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                            {user.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="date">{formatDate(user.createdAt)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="settings-section">
                                <h2>Payment Settings</h2>
                                <p className="settings-desc">Configure UPI details for user recharges</p>

                                {message && (
                                    <div className={`settings-msg ${message.includes('success') ? 'success' : 'error'}`}>
                                        {message}
                                    </div>
                                )}

                                <form onSubmit={handleSaveSettings} className="settings-form">
                                    <div className="form-group">
                                        <label className="form-label">UPI ID</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="yourname@paytm"
                                            value={settings.upiId}
                                            onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">UPI Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Your Name / Business Name"
                                            value={settings.upiName}
                                            onChange={(e) => setSettings({ ...settings, upiName: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">QR Code Image URL</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="https://example.com/qr.png"
                                            value={settings.qrCodeUrl}
                                            onChange={(e) => setSettings({ ...settings, qrCodeUrl: e.target.value })}
                                        />
                                        <small className="form-hint">Upload QR image to any hosting and paste the URL here</small>
                                    </div>

                                    {settings.qrCodeUrl && (
                                        <div className="qr-preview">
                                            <p>QR Preview:</p>
                                            <img src={settings.qrCodeUrl} alt="QR Code" />
                                        </div>
                                    )}

                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        {saving ? 'Saving...' : 'Save Settings'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Admin;
