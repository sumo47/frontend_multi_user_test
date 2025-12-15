import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSessionSummary } from '../api/result.api';
import './SessionSummary.css';

const SessionSummary = () => {
    const { sessionId } = useParams();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSummary();
    }, [sessionId]);

    const fetchSummary = async () => {
        try {
            const response = await getSessionSummary(sessionId);

            if (response.success) {
                setSummary(response.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load session summary');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="session-summary-page">
                <div className="container text-center">
                    <div className="spinner"></div>
                    <p className="mt-2">Loading summary...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="session-summary-page">
                <div className="container">
                    <div className="alert alert-error">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="session-summary-page">
            <div className="container">
                <div className="summary-header fade-in">
                    <h1>Session Summary</h1>
                    <div className="session-info">
                        <p className="test-title">{summary?.test?.title}</p>
                        <p className="session-code">Code: {summary?.sessionCode}</p>
                    </div>
                </div>

                <div className="summary-stats card-glass fade-in">
                    <div className="stat">
                        <div className="stat-value">{summary?.totalParticipants}</div>
                        <div className="stat-label">Total Participants</div>
                    </div>
                    <div className="stat">
                        <div className="stat-value">{summary?.test?.totalQuestions}</div>
                        <div className="stat-label">Total Questions</div>
                    </div>
                    <div className="stat">
                        <div className="stat-value">{summary?.sessionStatus}</div>
                        <div className="stat-label">Status</div>
                    </div>
                </div>

                <div className="leaderboard-section">
                    <h2>🏆 Leaderboard</h2>

                    <div className="leaderboard">
                        {summary?.participants?.map((participant, index) => (
                            <div
                                key={participant.userId}
                                className={`card-glass participant-row ${index === 0 ? 'first-place' : ''}`}
                            >
                                <div className="rank">
                                    {index === 0 && '🥇'}
                                    {index === 1 && '🥈'}
                                    {index === 2 && '🥉'}
                                    {index > 2 && `#${index + 1}`}
                                </div>

                                <div className="participant-details">
                                    <div className="participant-name">{participant.name}</div>
                                    <div className="participant-email text-muted">{participant.email}</div>
                                </div>

                                <div className="participant-stats">
                                    <div className="score-display">
                                        <div className="score-number">{participant.score}</div>
                                        <div className="score-total">/{summary?.test?.totalQuestions}</div>
                                    </div>
                                    <div className="percentage">{participant.percentage}%</div>
                                    <div className="breakdown">
                                        <span className="correct text-success">✓ {participant.correctAnswers}</span>
                                        <span className="wrong text-error">✗ {participant.wrongAnswers}</span>
                                    </div>
                                </div>

                                <div className={`status-badge ${participant.status.toLowerCase()}`}>
                                    {participant.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="summary-actions">
                    <Link to="/" className="btn btn-primary">
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SessionSummary;
