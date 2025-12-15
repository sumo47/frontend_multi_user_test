import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSessionStatus, markReady, joinSession, getAllSessions } from '../api/session.api';
import { useAuth } from '../context/AuthContext';
import './WaitingRoom.css';

const WaitingRoom = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [session, setSession] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [isReady, setIsReady] = useState(false);
    const pollingRef = useRef(null);

    // Poll session status every 3 seconds
    useEffect(() => {
        fetchSessionStatus();

        // Start polling
        pollingRef.current = setInterval(() => {
            fetchSessionStatus();
        }, 3000); // Poll every 3 seconds

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };
    }, [sessionId]);

    const fetchSessionStatus = async () => {
        try {
            const response = await getSessionStatus(sessionId);

            if (response.success) {
                const sessionData = response.data.session;
                setSession(sessionData);
                setLoading(false);

                // Check if current user is ready
                const currentParticipant = sessionData.participants.find(
                    p => p.email === user.email
                );
                if (currentParticipant) {
                    setIsReady(currentParticipant.status === 'READY');
                }

                // AUTO-REDIRECT: If session is ACTIVE, go to test screen
                if (sessionData.status === 'ACTIVE') {
                    clearInterval(pollingRef.current);
                    navigate(`/test/${sessionId}`);
                }
            }
        } catch (err) {
            console.log('Session status error:', err.response?.data);

            // If user is not a participant, try to auto-join
            if (err.response?.data?.message?.includes('not a participant')) {
                console.log('User not a participant, attempting auto-join...');
                setError('Joining session...');

                try {
                    // Fetch session code from getAllSessions
                    const sessionsResponse = await getAllSessions();
                    console.log('All sessions:', sessionsResponse.data);

                    const targetSession = sessionsResponse.data.find(s => s.id === sessionId);
                    console.log('Target session:', targetSession);

                    if (targetSession && targetSession.sessionCode) {
                        console.log('Found session code:', targetSession.sessionCode);

                        // Check session status before joining
                        if (targetSession.status !== 'WAITING') {
                            setError(`Cannot join this session. Session is ${targetSession.status}.`);
                            setLoading(false);
                            return;
                        }

                        // Auto-join using the session code
                        const joinResponse = await joinSession(targetSession.sessionCode);
                        console.log('Join response:', joinResponse);

                        if (joinResponse.success) {
                            console.log('Successfully joined, retrying status...');
                            setError('');

                            // Retry fetching status after joining
                            const retryResponse = await getSessionStatus(sessionId);
                            if (retryResponse.success) {
                                setSession(retryResponse.data.session);
                                setLoading(false);
                                return;
                            }
                        }
                    } else {
                        setError('Session not found in history');
                        setLoading(false);
                    }
                } catch (joinErr) {
                    console.error('Auto-join failed:', joinErr);

                    // If error is "already joined", that's actually success! Just retry status
                    if (joinErr.response?.data?.message?.includes('already joined')) {
                        console.log('Already joined, retrying status...');
                        try {
                            const retryResponse = await getSessionStatus(sessionId);
                            if (retryResponse.success) {
                                setSession(retryResponse.data.session);
                                setLoading(false);
                                return;
                            }
                        } catch (retryErr) {
                            setError(retryErr.response?.data?.message || 'Failed to load session');
                            setLoading(false);
                        }
                    } else {
                        setError(joinErr.response?.data?.message || 'Failed to join session automatically');
                        setLoading(false);
                    }
                }
            } else {
                setError(err.response?.data?.message || 'Failed to load session');
                setLoading(false);
            }
        }
    };

    const handleMarkReady = async () => {
        try {
            const response = await markReady(sessionId);

            if (response.success) {
                setIsReady(true);
                // Immediately fetch updated status
                fetchSessionStatus();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to mark as ready');
        }
    };

    if (loading) {
        return (
            <div className="waiting-room-page">
                <div className="container text-center">
                    <div className="spinner"></div>
                    <p className="mt-2">Loading session...</p>
                </div>
            </div>
        );
    }

    if (error && !session) {
        return (
            <div className="waiting-room-page">
                <div className="container">
                    <div className="alert alert-error">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    const readyCount = session?.participants.filter(p => p.status === 'READY').length || 0;
    const totalCount = session?.participants.length || 0;

    return (
        <div className="waiting-room-page">
            <div className="container">
                <div className="waiting-header fade-in">
                    <h1>Waiting Room</h1>
                    <div className="session-code-display">
                        <span className="code-label">Session Code:</span>
                        <span className="code-value">{session?.sessionCode}</span>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <div className="waiting-content">
                    <div className="card-glass info-panel">
                        <h2>📝 {session?.test?.title}</h2>
                        <div className="test-info">
                            <div className="info-item">
                                <span className="info-label">Questions:</span>
                                <span className="info-value">{session?.test?.questions?.length}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Duration:</span>
                                <span className="info-value">{session?.test?.duration} minutes</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Status:</span>
                                <span className={`status-badge ${session?.status?.toLowerCase()}`}>
                                    {session?.status}
                                </span>
                            </div>
                        </div>

                        <div className="ready-status">
                            <h3>Ready Status: {readyCount}/{totalCount}</h3>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${(readyCount / totalCount) * 100}%` }}
                                />
                            </div>
                        </div>

                        {!isReady ? (
                            <button
                                onClick={handleMarkReady}
                                className="btn btn-success btn-block btn-lg pulse"
                            >
                                ✓ Ready / Start Test
                            </button>
                        ) : (
                            <div className="alert alert-success">
                                ✓ You are ready! Waiting for other participants...
                            </div>
                        )}

                        <div className="alert alert-info mt-3">
                            ℹ️ The test will automatically start when ALL participants are ready
                        </div>
                    </div>

                    <div className="card-glass participants-panel">
                        <h2>👥 Participants ({totalCount})</h2>
                        <div className="participants-list">
                            {session?.participants.map((participant) => (
                                <div key={participant.id} className="participant-item">
                                    <div className="participant-info">
                                        <span className="participant-name">
                                            {participant.name}
                                            {participant.email === user.email && ' (You)'}
                                        </span>
                                        <span className="participant-email text-muted">
                                            {participant.email}
                                        </span>
                                    </div>
                                    <span className={`participant-status ${participant.status.toLowerCase()}`}>
                                        {participant.status === 'READY' ? '✓ Ready' : '⏳ Joined'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WaitingRoom;
