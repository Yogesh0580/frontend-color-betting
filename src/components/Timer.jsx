import { useEffect, useState } from 'react';
import './Timer.css';

const Timer = ({ remainingTime, isBettingOpen }) => {
    const [displayTime, setDisplayTime] = useState(remainingTime);

    useEffect(() => {
        setDisplayTime(remainingTime);
    }, [remainingTime]);

    const minutes = Math.floor(displayTime / 60);
    const seconds = displayTime % 60;

    const getTimerClass = () => {
        if (!isBettingOpen) return 'timer-closed';
        if (displayTime <= 10) return 'timer-urgent';
        if (displayTime <= 20) return 'timer-warning';
        return 'timer-normal';
    };

    const progress = (displayTime / 60) * 100;
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className={`timer ${getTimerClass()}`}>
            <div className="timer-circle">
                <svg viewBox="0 0 100 100">
                    <circle
                        className="timer-bg"
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        strokeWidth="6"
                    />
                    <circle
                        className="timer-progress"
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        strokeWidth="6"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                    />
                </svg>
                <div className="timer-content">
                    <div className="timer-value">
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </div>
                    <div className="timer-label">
                        {isBettingOpen ? 'Place your bet!' : 'Betting Closed'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Timer;
