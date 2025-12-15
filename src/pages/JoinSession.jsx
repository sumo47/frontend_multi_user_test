import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinSession } from '../api/session.api';
import './JoinSession.css';

const JoinSession = () => {
    const navigate = useNavigate();
    const [sessionCode, setSessionCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleJoinSession = async (e) => {
        e.preventDefault();
        setError('');

        if (!sessionCode.trim()) {
            setError('Please enter a session code');
            return;
        }

        setLoading(true);

        try {
            const response = await joinSession(sessionCode.toUpperCase());

            if (response.success) {
                const sessionId = response.data._id;
                navigate(`/waiting/${sessionId}`);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to join session');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="join-session-page">
            <div className="container">
                <div className="page-header fade-in">
                    <h1>🔗 Join Session</h1>
                    <p className="text-secondary">Enter the 6-character code to join</p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <div className="card-glass session-form-container fade-in">
                    <form onSubmit={handleJoinSession} className="session-form">
                        <div className="code-input-wrapper">
                            <label htmlFor="code" className="code-label">Session Code</label>
                            <input
                                type="text"
                                id="code"
                                value={sessionCode}
                                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                                placeholder="ABC123"
                                maxLength={6}
                                className="code-input"
                                required
                                autoFocus
                            />
                            <p className="code-hint">Enter the 6-character code shared by the session creator</p>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={() => navigate('/session')}
                                className="btn btn-outline"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Joining...' : 'Join Session'}
                            </button>
                        </div>
                    </form>

                    <div className="help-box">
                        <h3>💡 Don't have a code?</h3>
                        <p>Ask the session creator to share the 6-character code, or check the Session History to find active sessions.</p>
                        <button
                            onClick={() => navigate('/history')}
                            className="btn btn-secondary btn-sm mt-2"
                        >
                            View Session History
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JoinSession;
