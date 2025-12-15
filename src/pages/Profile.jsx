import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, getUsersCount } from '../api/user.api';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const { user: authUser, login } = useAuth();
    const [profile, setProfile] = useState(null);
    const [usersCount, setUsersCount] = useState(0);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        username: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProfile();
        fetchUsersCount();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await getProfile();
            if (response.success) {
                setProfile(response.data);
                setFormData({
                    name: response.data.name,
                    username: response.data.username || ''
                });
            }
        } catch (err) {
            setError('Failed to load profile');
        }
    };

    const fetchUsersCount = async () => {
        try {
            const response = await getUsersCount();
            if (response.success) {
                setUsersCount(response.data.count);
            }
        } catch (err) {
            console.error('Failed to load users count');
        }
    };

    const handleEdit = () => {
        setEditing(true);
        setError('');
        setSuccess('');
    };

    const handleCancel = () => {
        setEditing(false);
        setFormData({
            name: profile.name,
            username: profile.username || ''
        });
        setError('');
        setSuccess('');
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const updates = {};
            if (formData.name !== profile.name) updates.name = formData.name;
            if (formData.username && formData.username !== profile.username) {
                updates.username = formData.username;
            }

            const response = await updateProfile(updates);

            if (response.success) {
                setProfile(response.data);
                setEditing(false);
                setSuccess('Profile updated successfully!');

                // Update auth context with new user data
                login(localStorage.getItem('token'), response.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!profile) {
        return (
            <div className="profile-page">
                <div className="container text-center">
                    <div className="spinner"></div>
                    <p className="mt-2">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="container">
                <div className="page-header fade-in">
                    <h1>👤 My Profile</h1>
                    <p className="text-secondary">Manage your account details</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <div className="profile-grid">
                    <div className="card-glass profile-card fade-in">
                        <div className="profile-header">
                            <div className="profile-avatar">
                                {profile.name.charAt(0).toUpperCase()}
                            </div>
                            <h2>{profile.name}</h2>
                            {profile.username && (
                                <p className="username">@{profile.username}</p>
                            )}
                            <p className="email">{profile.email}</p>
                        </div>

                        {!editing ? (
                            <div className="profile-info">
                                <div className="info-row">
                                    <span className="info-label">Full Name:</span>
                                    <span className="info-value">{profile.name}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Username:</span>
                                    <span className="info-value">
                                        {profile.username ? `@${profile.username}` : (
                                            <span className="text-muted">Not set</span>
                                        )}
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Email:</span>
                                    <span className="info-value">{profile.email}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Member since:</span>
                                    <span className="info-value">
                                        {new Date(profile.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <button onClick={handleEdit} className="btn btn-primary btn-block">
                                    Edit Profile
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="profile-form">
                                <div className="form-group">
                                    <label htmlFor="name">Full Name *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        minLength={2}
                                        maxLength={100}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="username">Username</label>
                                    <div className="username-input">
                                        <span className="username-prefix">@</span>
                                        <input
                                            type="text"
                                            id="username"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            placeholder="your_username"
                                            minLength={3}
                                            maxLength={30}
                                            pattern="[a-z0-9_]+"
                                            title="Only lowercase letters, numbers, and underscores"
                                        />
                                    </div>
                                    <small className="form-hint">
                                        3-30 characters. Only lowercase letters, numbers, and underscores.
                                    </small>
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="btn btn-outline"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    <div className="card-glass stats-card fade-in" style={{ animationDelay: '0.1s' }}>
                        <h3>📊 Platform Stats</h3>
                        <div className="stats-list">
                            <div className="stat-item">
                                <div className="stat-icon">👥</div>
                                <div className="stat-info">
                                    <div className="stat-value">{usersCount}</div>
                                    <div className="stat-label">Total Users</div>
                                </div>
                            </div>
                        </div>

                        <div className="quick-actions">
                            <button
                                onClick={() => navigate('/')}
                                className="btn btn-outline btn-sm btn-block"
                            >
                                ← Back to Home
                            </button>
                            <button
                                onClick={() => navigate('/history')}
                                className="btn btn-secondary btn-sm btn-block"
                            >
                                📊 Session History
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
