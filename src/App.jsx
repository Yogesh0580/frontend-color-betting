import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Game from './pages/Game';
import Wallet from './pages/Wallet';
import Recharge from './pages/Recharge';
import Withdraw from './pages/Withdraw';
import History from './pages/History';
import Admin from './pages/Admin';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return isAdmin ? children : <Navigate to="/" />;
};

// Public Route (redirect to home if already logged in)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return isAuthenticated ? <Navigate to="/" /> : children;
};

// Layout with Navbar
const Layout = ({ children }) => {
    return (
        <>
            <Navbar />
            <main>{children}</main>
        </>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    } />
                    <Route path="/register" element={
                        <PublicRoute>
                            <Register />
                        </PublicRoute>
                    } />

                    {/* Protected Routes */}
                    <Route path="/" element={
                        <ProtectedRoute>
                            <GameProvider>
                                <Layout>
                                    <Game />
                                </Layout>
                            </GameProvider>
                        </ProtectedRoute>
                    } />
                    <Route path="/wallet" element={
                        <ProtectedRoute>
                            <Layout>
                                <Wallet />
                            </Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/recharge" element={
                        <ProtectedRoute>
                            <Layout>
                                <Recharge />
                            </Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/withdraw" element={
                        <ProtectedRoute>
                            <Layout>
                                <Withdraw />
                            </Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/history" element={
                        <ProtectedRoute>
                            <Layout>
                                <History />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    {/* Admin Routes */}
                    <Route path="/admin" element={
                        <AdminRoute>
                            <Layout>
                                <Admin />
                            </Layout>
                        </AdminRoute>
                    } />

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
