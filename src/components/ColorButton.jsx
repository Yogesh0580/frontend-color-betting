import './ColorButton.css';

const ColorButton = ({ color, selected, disabled, onClick, payout }) => {
    const colorConfig = {
        red: { label: 'Red', emoji: '🔴', multiplier: '2x' },
        green: { label: 'Green', emoji: '🟢', multiplier: '2x' },
        violet: { label: 'Violet', emoji: '🟣', multiplier: '4.5x' }
    };

    const config = colorConfig[color];

    return (
        <button
            className={`color-btn color-btn-${color} ${selected ? 'selected' : ''}`}
            disabled={disabled}
            onClick={() => onClick(color)}
        >
            <span className="color-emoji">{config.emoji}</span>
            <span className="color-label">{config.label}</span>
            <span className="color-multiplier">{payout || config.multiplier}</span>
        </button>
    );
};

export default ColorButton;
