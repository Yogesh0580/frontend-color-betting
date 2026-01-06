import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gameAPI } from '../services/api';
import BetHistory from '../components/BetHistory';
import './History.css';

const History = () => {
    const [activeTab, setActiveTab] = useState('results');
    const [gameResults, setGameResults] = useState([]);
    const [bets, setBets] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (activeTab === 'results') {
            fetchGameResults();
        } else {
            fetchBets();
        }
    }, [activeTab, page]);

    const fetchGameResults = async () => {
        setLoading(true);
        try {
            const response = await gameAPI.getGameHistory(page);
            setGameResults(response.data.games || []);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            // Silent error
        } finally {
            setLoading(false);
        }
    };

    const fetchBets = async () => {
        setLoading(true);
        try {
            const response = await gameAPI.getMyBets(page);
            setBets(response.data.bets || []);
            setStats(response.data.stats);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            // Silent error
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return '--';
        const date = new Date(dateStr);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '--';
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    const getColorEmoji = (color) => {
        const emojis = { red: '🔴', green: '🟢', violet: '🟣' };
        return emojis[color] || '⚪';
    };

    if (loading && gameResults.length === 0 && bets.length === 0) {
        return (
            <div className="history-loading">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="history-container">
            <h1 className="history-title">Game History</h1>

            {/* Tabs */}
            <div className="history-tabs">
                <button
                    className={`tab-btn ${activeTab === 'results' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('results'); setPage(1); }}
                >
                    🎯 Game Results
                </button>
                <button
                    className={`tab-btn ${activeTab === 'bets' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('bets'); setPage(1); }}
                >
                    🎲 My Bets
                </button>
            </div>

            {/* Game Results Tab */}
            {activeTab === 'results' && (
                <div className="results-container">
                    <p className="results-note">📌 Results are auto-deleted after 24 hours</p>

                    {gameResults.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">🎮</span>
                            <p>No game results yet</p>
                        </div>
                    ) : (
                        <div className="results-table-wrap">
                            <table className="results-table">
                                <thead>
                                    <tr>
                                        <th>Period</th>
                                        <th>Start Time</th>
                                        <th>End Time</th>
                                        <th>Result</th>
                                        <th>Total Bets</th>
                                        <th>Total Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {gameResults.map((game) => (
                                        <tr key={game._id}>
                                            <td className="period-cell">{game.gameId}</td>
                                            <td className="time-cell">{formatTime(game.startTime)}</td>
                                            <td className="time-cell">{formatTime(game.endTime)}</td>
                                            <td>
                                                <span className={`result-badge result-${game.result}`}>
                                                    {getColorEmoji(game.result)} {game.result}
                                                </span>
                                            </td>
                                            <td className="bets-cell">{game.totalBets}</td>
                                            <td className="amount-cell">₹{game.totalAmount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* My Bets Tab */}
            {activeTab === 'bets' && (
                <>
                    {stats && (
                        <div className="stats-grid">
                            <div className="stat-card">
                                <span className="stat-value">{stats.totalBets}</span>
                                <span className="stat-label">Total Bets</span>
                            </div>
                            <div className="stat-card stat-won">
                                <span className="stat-value">{stats.totalWon}</span>
                                <span className="stat-label">Won</span>
                            </div>
                            <div className="stat-card stat-lost">
                                <span className="stat-value">{stats.totalLost}</span>
                                <span className="stat-label">Lost</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-value">₹{stats.totalAmount?.toFixed(0) || 0}</span>
                                <span className="stat-label">Total Bet</span>
                            </div>
                            <div className="stat-card stat-payout">
                                <span className="stat-value">₹{stats.totalPayout?.toFixed(0) || 0}</span>
                                <span className="stat-label">Total Won</span>
                            </div>
                            <div className={`stat-card ${(stats.totalPayout - stats.totalAmount) >= 0 ? 'stat-profit' : 'stat-loss'}`}>
                                <span className="stat-value">
                                    {(stats.totalPayout - stats.totalAmount) >= 0 ? '+' : ''}
                                    ₹{((stats.totalPayout || 0) - (stats.totalAmount || 0)).toFixed(0)}
                                </span>
                                <span className="stat-label">Net P/L</span>
                            </div>
                        </div>
                    )}

                    <BetHistory bets={bets} />
                </>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        ← Prev
                    </button>
                    <span className="page-info">{page} / {totalPages}</span>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
};

export default History;
