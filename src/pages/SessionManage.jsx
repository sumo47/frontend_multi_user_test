import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTests } from '../api/test.api';
import { createSession, joinSession } from '../api/session.api';
import './SessionManage.css';

const SessionManage = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState('create'); // 'create' or 'join'
    const [tests, setTests] = useState([]);
    const [selectedTest, setSelectedTest] = useState('');
    const [sessionCode, setSessionCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (mode === 'create') {
            fetchTests();
        }
    }, [mode]);

    const fetchTests = async () => {
        try {
            const response = await getAllTests();
            if (response.success) {
                setTests(response.data);
            }
        } catch (err) {
            setError('Failed to load tests');
        }
    };

    const handleCreateSession = async (e) => {
        e.preventDefault();
        setError('');

        if (!selectedTest) {
            setError('Please select a test');
            return;
        }

        setLoading(true);

        try {
            const response = await createSession(selectedTest);

            if (response.success) {
                const sessionId = response.data._id;
                navigate(`/waiting/${sessionId}`);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create session');
        } finally {
            setLoading(false);
        }
    };

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
        <div className="session-manage-page">
            <div className="container">
                <div className="page-header fade-in">
                    <h1>Session Management</h1>
                    <p className="text-secondary">Create a new session or join an existing one</p>
                </div>

                <div className="mode-selector">
                    <button
                        className={`mode-btn ${mode === 'create' ? 'active' : ''}`}
                        onClick={() => setMode('create')}
                    >
                        Create Session
                    </button>
                    <button
                        className={`mode-btn ${mode === 'join' ? 'active' : ''}`}
                        onClick={() => setMode('join')}
                    >
                        Join Session
                    </button>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <div className="session-content card-glass">
                    {mode === 'create' ? (
                        <form onSubmit={handleCreateSession} className="session-form">
                            <h2>Create New Session</h2>
                            <p className="text-secondary mb-3">
                                Select a test to create a session. You'll receive a session code to share.
                            </p>

                            <div className="form-group">
                                <label htmlFor="test">Select Test *</label>
                                {tests.length === 0 ? (
                                    <div className="alert alert-info">
                                        No tests found. <a href="/create-test" className="auth-link">Create a test first</a>
                                    </div>
                                ) : (
                                    <select
                                        id="test"
                                        value={selectedTest}
                                        onChange={(e) => setSelectedTest(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Select a test --</option>
                                        {tests.map((test) => (
                                            <option key={test._id} value={test._id}>
                                                {test.title} - by {test.creatorId?.name || 'Unknown'} ({test.questions.length} questions, {test.duration} min)
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-block"
                                disabled={loading || tests.length === 0}
                            >
                                {loading ? 'Creating...' : 'Create Session'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleJoinSession} className="session-form">
                            <h2>Join Session</h2>
                            <p className="text-secondary mb-3">
                                Enter the 6-character session code to join an existing test session.
                            </p>

                            <div className="form-group">
                                <label htmlFor="code">Session Code *</label>
                                <input
                                    type="text"
                                    id="code"
                                    value={sessionCode}
                                    onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                                    placeholder="e.g., ABC123"
                                    maxLength={6}
                                    style={{
                                        textTransform: 'uppercase',
                                        fontSize: '1.5rem',
                                        textAlign: 'center',
                                        letterSpacing: '0.2em'
                                    }}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-block"
                                disabled={loading}
                            >
                                {loading ? 'Joining...' : 'Join Session'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SessionManage;
