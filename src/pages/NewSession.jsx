import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTests } from '../api/test.api';
import { createSession } from '../api/session.api';
import './NewSession.css';

const NewSession = () => {
    const navigate = useNavigate();
    const [tests, setTests] = useState([]);
    const [filteredTests, setFilteredTests] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTest, setSelectedTest] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTests();
    }, []);

    useEffect(() => {
        // Filter tests based on search query
        if (searchQuery.trim() === '') {
            setFilteredTests(tests);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = tests.filter(test =>
                test.title.toLowerCase().includes(query) ||
                (test.creatorId?.name && test.creatorId.name.toLowerCase().includes(query))
            );
            setFilteredTests(filtered);
        }
    }, [searchQuery, tests]);

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

    return (
        <div className="new-session-page">
            <div className="container">
                <div className="page-header fade-in">
                    <h1>Create New Session</h1>
                    <p className="text-secondary">Select a test to create a session</p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <div className="card-glass session-form-container fade-in">
                    <form onSubmit={handleCreateSession} className="session-form">
                        <div className="form-group custom-select-container">
                            <label htmlFor="test-search">Select Test *</label>

                            {tests.length === 0 ? (
                                <div className="alert alert-info">
                                    No tests found. <a href="/create-test" className="auth-link">Create a test first</a>
                                </div>
                            ) : (
                                <div className="searchable-select">
                                    <div className="search-input-wrapper">
                                        <input
                                            type="text"
                                            id="test-search"
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                setIsOpen(true);
                                                setSelectedTest(''); // Clear selection on type
                                            }}
                                            onFocus={() => setIsOpen(true)}
                                            placeholder={selectedTest ? "Test selected" : "Type to search test..."}
                                            className="search-input"
                                            autoComplete="off"
                                        />
                                        <span className={`arrow-icon ${isOpen ? 'open' : ''}`}>▼</span>
                                    </div>

                                    {isOpen && (
                                        <div className="dropdown-options card-glass">
                                            {filteredTests.length > 0 ? (
                                                filteredTests.map(test => (
                                                    <div
                                                        key={test._id}
                                                        className={`dropdown-option ${selectedTest === test._id ? 'selected' : ''}`}
                                                        onClick={() => {
                                                            setSelectedTest(test._id);
                                                            setSearchQuery(`${test.title} - by ${test.creatorId?.name || 'Unknown'}`);
                                                            setIsOpen(false);
                                                        }}
                                                    >
                                                        <div className="option-title">{test.title}</div>
                                                        <div className="option-meta">
                                                            by {test.creatorId?.name || 'Unknown'} • {test.questions.length} Qs • {test.duration} min
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="no-options">No tests found</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
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
                                disabled={loading || !selectedTest}
                            >
                                {loading ? 'Creating...' : 'Create Session'}
                            </button>
                        </div>
                    </form>
                </div>

                {isOpen && <div className="click-outside-overlay" onClick={() => setIsOpen(false)}></div>}
            </div>
        </div>
    );
};

export default NewSession;
