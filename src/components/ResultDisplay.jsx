import { useEffect, useState } from 'react';
import './ResultDisplay.css';

const ResultDisplay = ({ result, isWin, payout, userBet, onClose }) => {
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (isWin) {
            setShowConfetti(true);
            const timer = setTimeout(() => setShowConfetti(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [isWin]);

    // Auto close after 5 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const getColorEmoji = (color) => {
        const emojis = { red: '🔴', green: '🟢', violet: '🟣' };
        return emojis[color] || '⚪';
    };

    const getColorName = (color) => {
        return color?.charAt(0).toUpperCase() + color?.slice(1) || 'Unknown';
    };

    return (
        <div className="result-overlay" onClick={onClose}>
            <div className={`result-modal result-${result}`} onClick={e => e.stopPropagation()}>
                {/* Confetti Effect */}
                {showConfetti && (
                    <div className="confetti-container">
                        {[...Array(50)].map((_, i) => (
                            <div key={i} className="confetti" style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 2}s`,
                                backgroundColor: ['#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#ec4899'][Math.floor(Math.random() * 5)]
                            }} />
                        ))}
                    </div>
                )}

                {/* Result Announcement */}
                <div className="result-announcement">
                    <h2 className="result-heading">🎯 Result</h2>
                    <div className={`result-ball ball-${result}`}>
                        <span className="ball-emoji">{getColorEmoji(result)}</span>
                    </div>
                    <p className="result-color-name">{getColorName(result)}</p>
                </div>

                {/* User Bet Result - Only if user placed a bet */}
                {userBet && (
                    <div className="user-result">
                        <div className="divider"></div>

                        {isWin ? (
                            <>
                                <div className="result-status win">
                                    <span className="status-icon">🎉</span>
                                    <span className="status-text">You Won!</span>
                                </div>
                                <div className="payout-display">
                                    <span className="payout-label">Payout</span>
                                    <span className="payout-amount">+₹{payout}</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="result-status lose">
                                    <span className="status-icon">😔</span>
                                    <span className="status-text">Better luck next time!</span>
                                </div>
                                <div className="bet-comparison">
                                    <span className="your-bet">Your bet: {getColorEmoji(userBet.color)} {userBet.color}</span>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* No Bet Message */}
                {!userBet && (
                    <div className="no-bet-message">
                        <p>You didn't place a bet this round</p>
                    </div>
                )}

                <button className="btn btn-primary close-btn" onClick={onClose}>
                    Continue
                </button>
            </div>
        </div>
    );
};

export default ResultDisplay;
