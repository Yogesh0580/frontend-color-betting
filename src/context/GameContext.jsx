import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSocket, joinGameRoom } from '../services/socket';
import { gameAPI } from '../services/api';
import { useAuth } from './AuthContext';

const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
    const { user, updateBalance } = useAuth();
    const [currentGame, setCurrentGame] = useState(null);
    const [remainingTime, setRemainingTime] = useState(0);
    const [isBettingOpen, setIsBettingOpen] = useState(false);
    const [recentResults, setRecentResults] = useState([]);
    const [lastResult, setLastResult] = useState(null);
    const [showResultModal, setShowResultModal] = useState(false);
    const [userBetResult, setUserBetResult] = useState(null);

    useEffect(() => {
        if (user) {
            fetchCurrentGame();
            fetchRecentResults();
            setupSocket();
        }
    }, [user]);

    const fetchCurrentGame = async () => {
        try {
            const response = await gameAPI.getCurrentGame();
            setCurrentGame(response.data);
            setRemainingTime(response.data.remainingTime);
            setIsBettingOpen(response.data.status === 'betting');
        } catch (error) {
            // Silent error
        }
    };

    const fetchRecentResults = async () => {
        try {
            const response = await gameAPI.getRecentResults();
            setRecentResults(response.data);
        } catch (error) {
            // Silent error
        }
    };

    const setupSocket = useCallback(() => {
        const socket = getSocket();

        if (user) {
            joinGameRoom(user._id);
        }

        socket.on('new-game', (game) => {
            setCurrentGame(game);
            setRemainingTime(game.remainingTime);
            setIsBettingOpen(true);
            setShowResultModal(false);
            setUserBetResult(null);
            setLastResult(null);
        });

        socket.on('countdown', (data) => {
            setRemainingTime(data.remainingTime);
            setIsBettingOpen(data.isBettingOpen);
        });

        socket.on('betting-closed', () => {
            setIsBettingOpen(false);
        });

        socket.on('game-result', (data) => {
            setLastResult(data);
            setCurrentGame(prev => ({ ...prev, status: 'completed', result: data.result }));
            setShowResultModal(true);
            fetchRecentResults();
        });

        socket.on('bet-result', (data) => {
            if (user && data.userId === user._id) {
                setUserBetResult(data);
                if (data.newBalance !== undefined) {
                    updateBalance(data.newBalance);
                }
            }
        });

        return () => {
            socket.off('new-game');
            socket.off('countdown');
            socket.off('betting-closed');
            socket.off('game-result');
            socket.off('bet-result');
        };
    }, [user, updateBalance]);

    const placeBet = async (color, amount) => {
        if (!currentGame || !isBettingOpen) {
            throw new Error('Betting is closed');
        }

        const response = await gameAPI.placeBet({
            gameId: currentGame.gameId,
            color,
            amount
        });

        if (response.data.newBalance !== undefined) {
            updateBalance(response.data.newBalance);
        }

        return response.data;
    };

    const closeResultModal = () => {
        setShowResultModal(false);
        setUserBetResult(null);
    };

    return (
        <GameContext.Provider value={{
            currentGame,
            remainingTime,
            isBettingOpen,
            recentResults,
            lastResult,
            showResultModal,
            userBetResult,
            placeBet,
            closeResultModal,
            fetchRecentResults
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};

export default GameContext;
