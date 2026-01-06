import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo - Left */}
                <Link to="/" className="navbar-logo">
                    <span className="logo-icon">🎯</span>
                    <span className="logo-text">ColorBet</span>
                </Link>

                {/* Right side items */}
                <div className="navbar-right">
                    {user ? (
                        <>
                            {/* Navigation Links */}
                            <div className="nav-links">
                                <Link to="/" className="nav-link">Play</Link>
                                <Link to="/wallet" className="nav-link">Wallet</Link>
                                <Link to="/history" className="nav-link">History</Link>
                                {isAdmin && (
                                    <Link to="/admin" className="nav-link nav-admin">Admin</Link>
                                )}
                            </div>

                            {/* Balance Chip */}
                            <div className="balance-chip">
                                <span className="balance-icon">💰</span>
                                <span className="balance-value">₹{user.balance?.toFixed(0) || '0'}</span>
                            </div>

                            {/* User Menu */}
                            <div className="user-menu">
                                <span className="user-avatar">{user.username?.charAt(0).toUpperCase()}</span>
                                <button onClick={handleLogout} className="btn-logout" title="Logout">
                                    ⏻
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="btn btn-ghost">Login</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
