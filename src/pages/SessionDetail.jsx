import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSessionSummary } from '../api/result.api';
import './SessionDetail.css';

const SessionDetail = () => {
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
            setError(err.response?.data?.message || 'Failed to load session details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="session-detail-page">
                <div className="container text-center">
                    <div className="spinner"></div>
                    <p className="mt-2">Loading session details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="session-detail-page">
                <div className="container">
                    <div className="alert alert-error">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="session-detail-page">
            <div className="container">
                <div className="detail-header fade-in">
                    <div>
                        <h1>Session Details</h1>
                        <p className="test-title">{summary?.test?.title}</p>
                    </div>
                    <div className="session-code-large">
                        {summary?.sessionCode}
                    </div>
                </div>

                <div className="detail-grid">
                    {/* Session Info Card */}
                    <div className="card-glass info-card fade-in">
                        <h2>📋 Session Information</h2>
                        <div className="info-list">
                            <div className="info-item">
                                <span className="label">Status:</span>
                                <span className={`status-badge ${summary?.sessionStatus?.toLowerCase()}`}>
                                    {summary?.sessionStatus}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="label">Total Questions:</span>
                                <span className="value">{summary?.test?.totalQuestions}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Total Participants:</span>
                                <span className="value">{summary?.totalParticipants}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Session Code:</span>
                                <span className="value code">{summary?.sessionCode}</span>
                            </div>
                        </div>
                    </div>

                    {/* Leaderboard Card */}
                    <div className="card-glass leaderboard-card fade-in" style={{ animationDelay: '0.1s' }}>
                        <h2>🏆 Leaderboard</h2>
                        <div className="leaderboard-list">
                            {summary?.participants?.map((participant, index) => (
                                <div
                                    key={participant.userId}
                                    className={`participant-row ${index === 0 ? 'first-place' : ''}`}
                                >
                                    <div className="rank-badge">
                                        {index === 0 && '🥇'}
                                        {index === 1 && '🥈'}
                                        {index === 2 && '🥉'}
                                        {index > 2 && `#${index + 1}`}
                                    </div>

                                    <div className="participant-info">
                                        <div className="participant-name">{participant.name}</div>
                                        <div className="participant-email">{participant.email}</div>
                                    </div>

                                    <div className="participant-score">
                                        <div className="score-number">{participant.score}</div>
                                        <div className="score-total">/{summary?.test?.totalQuestions}</div>
                                    </div>

                                    <div className="participant-percentage">
                                        {participant.percentage}%
                                    </div>

                                    <div className="participant-breakdown">
                                        <span className="correct">✓ {participant.correctAnswers}</span>
                                        <span className="wrong">✗ {participant.wrongAnswers}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Participants Details */}
                <div className="participants-section">
                    <h2>👥 All Participants ({summary?.totalParticipants})</h2>
                    <div className="participants-grid">
                        {summary?.participants?.map((participant) => (
                            <div key={participant.userId} className="card-glass participant-card fade-in">
                                <div className="participant-header">
                                    <div className="avatar">
                                        {participant.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="participant-details">
                                        <h3>{participant.name}</h3>
                                        <p className="email">{participant.email}</p>
                                    </div>
                                </div>

                                <div className="participant-stats-grid">
                                    <div className="stat">
                                        <div className="stat-value">{participant.score}</div>
                                        <div className="stat-label">Score</div>
                                    </div>
                                    <div className="stat">
                                        <div className="stat-value text-success">{participant.correctAnswers}</div>
                                        <div className="stat-label">Correct</div>
                                    </div>
                                    <div className="stat">
                                        <div className="stat-value text-error">{participant.wrongAnswers}</div>
                                        <div className="stat-label">Wrong</div>
                                    </div>
                                    <div className="stat">
                                        <div className="stat-value">{participant.percentage}%</div>
                                        <div className="stat-label">Accuracy</div>
                                    </div>
                                </div>

                                <div className={`status-indicator ${participant.status?.toLowerCase()}`}>
                                    {participant.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="actions-section">
                    <Link to="/history" className="btn btn-outline">
                        ← Back to History
                    </Link>
                    <Link to="/" className="btn btn-primary">
                        🏠 Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SessionDetail;
