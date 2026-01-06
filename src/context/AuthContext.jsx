import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            try {
                const response = await authAPI.getProfile();
                setUser(response.data);
                localStorage.setItem('user', JSON.stringify(response.data));
            } catch (error) {
                logout();
            }
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        const response = await authAPI.login({ email, password });
        const { token, ...userData } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);

        return userData;
    };

    const register = async (username, email, password) => {
        const response = await authAPI.register({ username, email, password });
        const { token, ...userData } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);

        return userData;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const updateBalance = (newBalance) => {
        if (user) {
            const updatedUser = { ...user, balance: newBalance };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    const refreshUser = async () => {
        try {
            const response = await authAPI.getProfile();
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
            // Silent error
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            logout,
            updateBalance,
            refreshUser,
            isAuthenticated: !!user,
            isAdmin: user?.role === 'admin'
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
