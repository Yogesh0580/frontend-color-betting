import './BetHistory.css';

const BetHistory = ({ bets }) => {
    const getColorEmoji = (color) => {
        const emojis = { red: '🔴', green: '🟢', violet: '🟣' };
        return emojis[color] || '⚪';
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '--';
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '--';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short'
        });
    };

    if (!bets || bets.length === 0) {
        return (
            <div className="bet-history">
                <div className="empty-bets">
                    <span className="empty-icon">🎲</span>
                    <p>No bets yet. Start playing!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bet-history">
            <div className="bets-list">
                {bets.map((bet) => (
                    <div key={bet._id} className={`bet-card ${bet.status}`}>
                        {/* Header */}
                        <div className="bet-header">
                            <div className="bet-period">
                                <span className="period-label">Period</span>
                                <span className="period-value">{bet.gameId}</span>
                            </div>
                            <div className={`bet-status-badge ${bet.status}`}>
                                {bet.status === 'won' ? '🎉 Won' : bet.status === 'lost' ? '❌ Lost' : '⏳ Pending'}
                            </div>
                        </div>

                        {/* Time Info */}
                        <div className="bet-times">
                            <div className="time-item">
                                <span className="time-label">Date</span>
                                <span className="time-value">{formatDate(bet.createdAt)}</span>
                            </div>
                            <div className="time-item">
                                <span className="time-label">Bet Time</span>
                                <span className="time-value">{formatTime(bet.createdAt)}</span>
                            </div>
                        </div>

                        {/* Color Comparison */}
                        <div className="bet-colors">
                            <div className="color-box your-bet">
                                <span className="color-label">Your Bet</span>
                                <div className={`color-circle color-${bet.color}`}>
                                    {getColorEmoji(bet.color)}
                                </div>
                                <span className="color-name">{bet.color}</span>
                            </div>

                            <div className="vs-divider">
                                <span>VS</span>
                            </div>

                            <div className="color-box result">
                                <span className="color-label">Result</span>
                                <div className={`color-circle color-${bet.resultColor || 'unknown'}`}>
                                    {bet.resultColor ? getColorEmoji(bet.resultColor) : '❓'}
                                </div>
                                <span className="color-name">{bet.resultColor || 'Pending'}</span>
                            </div>
                        </div>

                        {/* Amount Info */}
                        <div className="bet-amounts">
                            <div className="amount-item">
                                <span className="amount-label">Bet Amount</span>
                                <span className="amount-value">₹{bet.amount}</span>
                            </div>
                            <div className="amount-item">
                                <span className="amount-label">Payout</span>
                                <span className={`amount-value ${bet.payout > 0 ? 'win' : ''}`}>
                                    {bet.payout > 0 ? `+₹${bet.payout}` : '₹0'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BetHistory;
