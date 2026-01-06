import { Link } from 'react-router-dom';
import './RecentResults.css';

const RecentResults = ({ results }) => {
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

    if (!results || results.length === 0) {
        return (
            <div className="recent-results">
                <div className="results-header">
                    <h3 className="results-title">Recent Results</h3>
                </div>
                <p className="no-results">No results yet</p>
            </div>
        );
    }

    return (
        <div className="recent-results">
            <div className="results-header">
                <h3 className="results-title">Recent Results</h3>
                <Link to="/history" className="view-all-link">View All →</Link>
            </div>

            <div className="results-note">
                <span>⭐</span> Results are auto-deleted after 24 hours
            </div>

            <div className="results-table-wrap">
                <table className="results-table">
                    <thead>
                        <tr>
                            <th>Period</th>
                            <th>Start Time</th>
                            <th>End Time</th>
                            <th>Result</th>
                            <th>Total Bets</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.slice(0, 10).map((game, index) => (
                            <tr key={game._id || index}>
                                <td className="cell-period">{game.gameId}</td>
                                <td className="cell-time">{formatTime(game.startTime)}</td>
                                <td className="cell-time">{formatTime(game.endTime)}</td>
                                <td>
                                    <span className={`result-badge result-${game.result}`}>
                                        <span className="badge-dot"></span>
                                        {game.result}
                                    </span>
                                </td>
                                <td className="cell-bets">{game.totalBets || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentResults;
