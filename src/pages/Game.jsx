import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import Timer from '../components/Timer';
import ColorButton from '../components/ColorButton';
import ResultDisplay from '../components/ResultDisplay';
import './Game.css';

const Game = () => {
    const { user, refreshUser } = useAuth();
    const {
        currentGame,
        remainingTime,
        isBettingOpen,
        recentResults,
        showResultModal,
        userBetResult,
        lastResult,
        placeBet,
        closeResultModal
    } = useGame();

    const [selectedColor, setSelectedColor] = useState(null);
    const [betAmount, setBetAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [currentBet, setCurrentBet] = useState(null);

    const quickAmounts = [10, 50, 100, 500];

    // Auto refresh balance when result comes in
    useEffect(() => {
        if (userBetResult) {
            refreshUser();
            setCurrentBet(null);
        }
    }, [userBetResult]);

    // Clear current bet when new game starts
    useEffect(() => {
        if (currentGame?.status === 'betting') {
            setCurrentBet(null);
            setSuccess('');
            setError('');
        }
    }, [currentGame?.gameId]);

    const handleColorSelect = (color) => {
        if (isBettingOpen) {
            setSelectedColor(color);
            setError('');
        }
    };

    const handleQuickAmount = (amount) => {
        setBetAmount(amount.toString());
        setError('');
    };

    const handlePlaceBet = async () => {
        setError('');
        setSuccess('');

        if (!selectedColor) {
            setError('Select a color');
            return;
        }

        const amount = parseFloat(betAmount);
        if (!amount || amount < 10) {
            setError('Min ₹10');
            return;
        }

        if (amount > user.balance) {
            setError('Insufficient balance');
            return;
        }

        setLoading(true);

        try {
            const result = await placeBet(selectedColor, amount);
            setCurrentBet({
                color: selectedColor,
                amount: amount,
                potentialWin: result.bet.potentialWin
            });
            setSuccess(`Bet placed!`);
            setSelectedColor(null);
            setBetAmount('');
            refreshUser(); // Update balance after bet
        } catch (err) {
            setError(err.response?.data?.message || 'Failed');
        } finally {
            setLoading(false);
        }
    };

    const getColorEmoji = (color) => {
        const emojis = { red: '🔴', green: '🟢', violet: '🟣' };
        return emojis[color] || '⚪';
    };

    const handleResultClose = () => {
        closeResultModal();
        refreshUser(); // Make sure balance is updated
    };

    return (
        <div className="game-page">
            {/* Top Info Bar */}
            <div className="game-info-bar">
                <div className="info-left">
                    <span className="info-label">Period</span>
                    <span className="info-value">{currentGame?.gameId || '---'}</span>
                </div>
                <div className="info-center">
                    <Timer remainingTime={remainingTime} isBettingOpen={isBettingOpen} />
                </div>
                <div className="info-right">
                    {currentBet ? (
                        <>
                            <span className="info-label">Your Bet</span>
                            <span className="bet-info">
                                {getColorEmoji(currentBet.color)} ₹{currentBet.amount}
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="info-label">Balance</span>
                            <span className="info-value balance">₹{user?.balance?.toFixed(0) || '0'}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Betting Section */}
            <div className="betting-section">
                <h3 className="section-title">Choose Color</h3>

                <div className="color-grid">
                    <ColorButton
                        color="red"
                        selected={selectedColor === 'red'}
                        disabled={!isBettingOpen}
                        onClick={handleColorSelect}
                    />
                    <ColorButton
                        color="green"
                        selected={selectedColor === 'green'}
                        disabled={!isBettingOpen}
                        onClick={handleColorSelect}
                    />
                    <ColorButton
                        color="violet"
                        selected={selectedColor === 'violet'}
                        disabled={!isBettingOpen}
                        onClick={handleColorSelect}
                    />
                </div>

                <div className="bet-controls">
                    <div className="quick-amounts">
                        {quickAmounts.map((amt) => (
                            <button
                                key={amt}
                                className={`quick-btn ${betAmount === amt.toString() ? 'active' : ''}`}
                                onClick={() => handleQuickAmount(amt)}
                                disabled={!isBettingOpen}
                            >
                                ₹{amt}
                            </button>
                        ))}
                    </div>

                    <div className="bet-row">
                        <div className="bet-input-wrap">
                            <span className="currency">₹</span>
                            <input
                                type="number"
                                className="bet-input"
                                placeholder="Amount"
                                value={betAmount}
                                onChange={(e) => setBetAmount(e.target.value)}
                                disabled={!isBettingOpen}
                                min="10"
                            />
                        </div>
                        <button
                            className="btn btn-primary place-btn"
                            onClick={handlePlaceBet}
                            disabled={!isBettingOpen || loading || !selectedColor || !betAmount}
                        >
                            {loading ? '...' : 'BET'}
                        </button>
                    </div>

                    {error && <div className="msg error">{error}</div>}
                    {success && <div className="msg success">{success}</div>}
                </div>
            </div>

            {/* Recent Results */}
            <div className="results-section">
                <div className="section-header">
                    <h3 className="section-title">Recent Results</h3>
                    <Link to="/history" className="view-all">View All →</Link>
                </div>
                <div className="results-grid">
                    {recentResults && recentResults.length > 0 ? (
                        recentResults.slice(0, 10).map((game, idx) => (
                            <div key={game._id || idx} className={`result-item result-${game.result}`}>
                                {getColorEmoji(game.result)}
                            </div>
                        ))
                    ) : (
                        <p className="no-results">No results yet</p>
                    )}
                </div>
                <div className="payout-info">
                    <span>🔴 2x</span>
                    <span>🟢 2x</span>
                    <span>🟣 4.5x</span>
                </div>
            </div>

            {/* Result Modal - Shows for ALL users when result announced */}
            {showResultModal && lastResult && (
                <ResultDisplay
                    result={lastResult.result}
                    isWin={userBetResult?.status === 'won'}
                    payout={userBetResult?.payout || 0}
                    userBet={currentBet || (userBetResult ? { color: userBetResult.color } : null)}
                    onClose={handleResultClose}
                />
            )}
        </div>
    );
};

export default Game;
