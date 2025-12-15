import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllSessions } from '../api/session.api';
import './SessionHistory.css';

const SessionHistory = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all'); // 'all', 'waiting', 'active', 'completed'

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const response = await getAllSessions();

            if (response.success) {
                setSessions(response.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load sessions');
        } finally {
            setLoading(false);
        }
    };

    const filteredSessions = sessions.filter(session => {
        if (filter === 'all') return true;
        return session.status.toLowerCase() === filter;
    });

    const formatTime = (seconds) => {
        if (seconds === null) return null;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'waiting': return '#f59e0b';
            case 'active': return '#10b981';
            case 'completed': return '#6366f1';
            default: return '#94a3b8';
        }
    };

    if (loading) {
        return (
            <div className="session-history-page">
                <div className="container text-center">
                    <div className="spinner"></div>
                    <p className="mt-2">Loading sessions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="session-history-page">
            <div className="container">
                <div className="page-header fade-in">
                    <h1>Session History</h1>
                    <p className="text-secondary">View all test sessions across the platform</p>
                </div>

                {error && (
                    <div className="alert alert-error">{error}</div>
                )}

                <div className="filters">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All ({sessions.length})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'waiting' ? 'active' : ''}`}
                        onClick={() => setFilter('waiting')}
                    >
                        Waiting ({sessions.filter(s => s.status === 'WAITING').length})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                        onClick={() => setFilter('active')}
                    >
                        Active ({sessions.filter(s => s.status === 'ACTIVE').length})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                        onClick={() => setFilter('completed')}
                    >
                        Completed ({sessions.filter(s => s.status === 'COMPLETED').length})
                    </button>
                </div>

                <div className="sessions-grid">
                    {filteredSessions.length === 0 ? (
                        <div className="card-glass text-center" style={{ padding: '3rem' }}>
                            <h3>No sessions found</h3>
                            <p className="text-secondary">
                                {filter !== 'all'
                                    ? `No ${filter} sessions available`
                                    : 'No sessions have been created yet'}
                            </p>
                        </div>
                    ) : (
                        filteredSessions.map((session) => (
                            <div key={session.id} className="card-glass session-card fade-in">
                                <div className="session-header">
                                    <div className="session-code-badge">
                                        {session.sessionCode}
                                    </div>
                                    <div
                                        className="status-pill"
                                        style={{ backgroundColor: getStatusColor(session.status) }}
                                    >
                                        {session.status}
                                    </div>
                                </div>

                                <h3 className="session-test-title">{session.test.title}</h3>

                                <div className="session-info-grid">
                                    <div className="info-box">
                                        <span className="info-label">Created by</span>
                                        <span className="info-value">{session.createdBy.name}</span>
                                    </div>
                                    <div className="info-box">
                                        <span className="info-label">Duration</span>
                                        <span className="info-value">{session.test.duration} min</span>
                                    </div>
                                    <div className="info-box">
                                        <span className="info-label">Questions</span>
                                        <span className="info-value">{session.test.questionCount}</span>
                                    </div>
                                    <div className="info-box">
                                        <span className="info-label">Participants</span>
                                        <span className="info-value">
                                            {session.participantCount}
                                            {session.status === 'COMPLETED' && ` (${session.submittedCount} submitted)`}
                                        </span>
                                    </div>
                                </div>

                                {session.status === 'ACTIVE' && session.remainingTime !== null && (
                                    <div className="time-remaining">
                                        ⏱️ Time Remaining: {formatTime(session.remainingTime)}
                                    </div>
                                )}

                                <div className="session-actions">
                                    {session.status === 'COMPLETED' && (
                                        <Link
                                            to={`/session-detail/${session.id}`}
                                            className="btn btn-outline btn-sm btn-block"
                                        >
                                            View Details
                                        </Link>
                                    )}

                                    {session.status === 'WAITING' && (
                                        <Link
                                            to={`/waiting/${session.id}`}
                                            className="btn btn-primary btn-sm btn-block"
                                        >
                                            Join Session
                                        </Link>
                                    )}
                                </div>

                                <div className="session-time text-muted">
                                    Created: {new Date(session.createdAt).toLocaleString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default SessionHistory;
