import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTest } from '../api/test.api';
import { extractQuestionsFromImage } from '../api/ai.api';
import './CreateTest.css';

const CreateTest = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        duration: 10
    });
    const [questions, setQuestions] = useState([
        { questionText: '', options: ['', '', '', ''], correctOption: 0 }
    ]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showDemo, setShowDemo] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [extractedQuestions, setExtractedQuestions] = useState([]);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [cameraActive, setCameraActive] = useState(false);

    const handleFormChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleQuestionChange = (index, field, value) => {
        const updated = [...questions];
        updated[index][field] = value;
        setQuestions(updated);
    };

    const handleOptionChange = (qIndex, optIndex, value) => {
        const updated = [...questions];
        updated[qIndex].options[optIndex] = value;
        setQuestions(updated);
    };

    const addQuestion = () => {
        setQuestions([
            ...questions,
            { questionText: '', options: ['', '', '', ''], correctOption: 0 }
        ]);
    };

    const removeQuestion = (index) => {
        if (questions.length > 1) {
            setQuestions(questions.filter((_, i) => i !== index));
        }
    };

    // JSON File Upload Handler
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                let content = event.target.result;

                // Auto-strip markdown code blocks if present
                content = content.trim();
                if (content.startsWith('```')) {
                    // Remove markdown code fences
                    content = content.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
                }

                const json = JSON.parse(content);

                // Validate JSON structure
                if (!Array.isArray(json)) {
                    throw new Error('JSON must be an array of questions');
                }

                const validatedQuestions = json.map((q, index) => {
                    if (!q.question || typeof q.question !== 'string') {
                        throw new Error(`Question ${index + 1}: Missing or invalid 'question' field`);
                    }
                    if (!Array.isArray(q.options) || q.options.length !== 4) {
                        throw new Error(`Question ${index + 1}: Must have exactly 4 options`);
                    }
                    if (typeof q.correct !== 'number' || q.correct < 0 || q.correct > 3) {
                        throw new Error(`Question ${index + 1}: 'correct' must be 0, 1, 2, or 3`);
                    }

                    return {
                        questionText: q.question,
                        options: q.options,
                        correctOption: q.correct
                    };
                });

                setQuestions(validatedQuestions);
                setError('');
                alert(`✅ Successfully imported ${validatedQuestions.length} questions!`);
            } catch (err) {
                setError(`❌ Invalid JSON: ${err.message}\n\nTip: Make sure your file contains only pure JSON (no \`\`\`json markers)`);
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset file input
    };

    // Download Template
    const downloadTemplate = () => {
        const template = [
            {
                question: "What is 2 + 2?",
                options: ["2", "3", "4", "5"],
                correct: 2
            },
            {
                question: "What is the capital of France?",
                options: ["London", "Berlin", "Paris", "Madrid"],
                correct: 2
            }
        ];

        const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'questions-template.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    // AI Extraction Handlers
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                setCameraActive(true);
            }
        } catch (err) {
            setError('Failed to access camera: ' + err.message);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setCameraActive(false);
        }
    };

    const captureImage = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const video = videoRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        stopCamera();
        await extractWithAI(imageData);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            await extractWithAI(event.target.result);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const extractWithAI = async (imageBase64) => {
        setAiLoading(true);
        setError('');

        try {
            const response = await extractQuestionsFromImage(imageBase64);

            if (response.success && response.data.length > 0) {
                setExtractedQuestions(response.data);
                setShowPreview(true);
            } else {
                setError('No questions found in the image. Please try another image.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'AI extraction failed. Please try again.');
        } finally {
            setAiLoading(false);
        }
    };

    const handlePreviewEdit = (index, field, value) => {
        const updated = [...extractedQuestions];
        if (field === 'question') {
            updated[index].question = value;
        } else if (field === 'correct') {
            updated[index].correct = parseInt(value);
        } else if (field.startsWith('option_')) {
            const optIndex = parseInt(field.split('_')[1]);
            updated[index].options[optIndex] = value;
        }
        setExtractedQuestions(updated);
    };

    const importExtractedQuestions = () => {
        const formatted = extractedQuestions.map(q => ({
            questionText: q.question,
            options: q.options,
            correctOption: q.correct
        }));
        setQuestions(formatted);
        setShowPreview(false);
        alert(`✅ Imported ${formatted.length} questions! Review and edit as needed.`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.questionText.trim()) {
                setError(`Question ${i + 1}: Question text is required`);
                return;
            }
            if (q.options.some(opt => !opt.trim())) {
                setError(`Question ${i + 1}: All options must be filled`);
                return;
            }
        }

        setLoading(true);

        try {
            const testData = {
                ...formData,
                duration: parseInt(formData.duration),
                questions
            };

            const response = await createTest(testData);

            if (response.success) {
                navigate('/session');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create test');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-test-page">
            <div className="container">
                <div className="page-header fade-in">
                    <h1>Create New Test</h1>
                    <p className="text-secondary">Design your own MCQ test</p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="test-form fade-in">
                    <div className="card-glass test-info-section">
                        <h2>Test Information</h2>

                        <div className="form-group">
                            <label htmlFor="title">Test Title *</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleFormChange}
                                placeholder="e.g., Mathematics Quiz 1"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="duration">Duration (minutes) *</label>
                            <input
                                type="number"
                                id="duration"
                                name="duration"
                                value={formData.duration}
                                onChange={handleFormChange}
                                min="1"
                                max="180"
                                required
                            />
                        </div>
                    </div>

                    {/* Bulk Import Section */}
                    <div className="card-glass bulk-import-section">
                        <h2>📤 Bulk Import Questions (Optional)</h2>
                        <p className="text-secondary">Upload a JSON file to quickly add multiple questions</p>

                        <div className="bulk-actions">
                            <label className="btn btn-secondary file-upload-btn">
                                📁 Upload JSON File
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                />
                            </label>

                            <button
                                type="button"
                                onClick={downloadTemplate}
                                className="btn btn-outline"
                            >
                                ⬇️ Download Template
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowDemo(!showDemo)}
                                className="btn btn-outline"
                            >
                                {showDemo ? '▲ Hide' : '▼ Show'} Example
                            </button>
                        </div>

                        {showDemo && (
                            <div className="demo-section">
                                <div className="alert alert-warning">
                                    <strong>⚠️ Important:</strong> Your .json file should contain <strong>ONLY</strong> the JSON array below (without the ```json markers shown here for display)
                                </div>

                                <h3>📋 JSON Format Example:</h3>
                                <pre className="json-example">
                                    {`[
  {
    "question": "What is 2 + 2?",
    "options": ["2", "3", "4", "5"],
    "correct": 2
  },
  {
    "question": "What is the capital of France?",
    "options": ["London", "Berlin", "Paris", "Madrid"],
    "correct": 2
  }
]`}
                                </pre>
                                <div className="alert alert-info">
                                    <strong>Format Rules:</strong>
                                    <ul>
                                        <li>Must be a JSON array of objects</li>
                                        <li><code>question</code>: The question text (string)</li>
                                        <li><code>options</code>: Array of exactly 4 options (strings)</li>
                                        <li><code>correct</code>: Index of correct answer (0, 1, 2, or 3)</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* AI Extraction Section */}
                    <div className="card-glass ai-extract-section">
                        <h2>🤖 AI Question Extraction (Beta)</h2>
                        <p className="text-secondary">Use AI to extract questions from images</p>

                        <div className="ai-actions">
                            {!cameraActive ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={startCamera}
                                        className="btn btn-primary"
                                        disabled={aiLoading}
                                    >
                                        📷 Capture from Camera
                                    </button>

                                    <label className="btn btn-secondary">
                                        🖼️ Upload Image
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={aiLoading}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                </>
                            ) : (
                                <div className="camera-section">
                                    <video ref={videoRef} className="camera-preview" />
                                    <div className="camera-controls">
                                        <button
                                            type="button"
                                            onClick={captureImage}
                                            className="btn btn-success"
                                        >
                                            📸 Capture
                                        </button>
                                        <button
                                            type="button"
                                            onClick={stopCamera}
                                            className="btn btn-outline"
                                        >
                                            ✕ Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <canvas ref={canvasRef} style={{ display: 'none' }} />

                        {aiLoading && (
                            <div className="ai-loading">
                                <div className="spinner"></div>
                                <p>🧠 AI is analyzing the image...</p>
                            </div>
                        )}
                    </div>

                    {/* Preview Modal */}
                    {showPreview && (
                        <div className="modal-overlay" onClick={() => setShowPreview(false)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h2>✨ Extracted Questions - Review & Edit</h2>
                                    <button onClick={() => setShowPreview(false)} className="close-btn">✕</button>
                                </div>

                                <div className="preview-questions">
                                    {extractedQuestions.map((q, index) => (
                                        <div key={index} className="preview-question-card">
                                            <h4>Question {index + 1}</h4>
                                            <textarea
                                                value={q.question}
                                                onChange={(e) => handlePreviewEdit(index, 'question', e.target.value)}
                                                rows="2"
                                            />

                                            <div className="preview-options">
                                                {q.options.map((opt, optIdx) => (
                                                    <div key={optIdx} className="preview-option">
                                                        <input
                                                            type="radio"
                                                            checked={q.correct === optIdx}
                                                            onChange={() => handlePreviewEdit(index, 'correct', optIdx)}
                                                        />
                                                        <input
                                                            type="text"
                                                            value={opt}
                                                            onChange={(e) => handlePreviewEdit(index, `option_${optIdx}`, e.target.value)}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="modal-actions">
                                    <button onClick={() => setShowPreview(false)} className="btn btn-outline">
                                        Cancel
                                    </button>
                                    <button onClick={importExtractedQuestions} className="btn btn-success">
                                        ✓ Import {extractedQuestions.length} Questions
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="questions-section">
                        <div className="questions-header">
                            <h2>Questions ({questions.length})</h2>
                            <button
                                type="button"
                                onClick={addQuestion}
                                className="btn btn-secondary"
                            >
                                + Add Question
                            </button>
                        </div>

                        {questions.map((question, qIndex) => (
                            <div key={qIndex} className="card-glass question-card">
                                <div className="question-header">
                                    <h3>Question {qIndex + 1}</h3>
                                    {questions.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeQuestion(qIndex)}
                                            className="btn btn-danger btn-sm"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Question Text *</label>
                                    <textarea
                                        value={question.questionText}
                                        onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                                        placeholder="Enter your question"
                                        rows="3"
                                        required
                                    />
                                </div>

                                <div className="options-grid">
                                    {question.options.map((option, optIndex) => (
                                        <div key={optIndex} className="option-group">
                                            <label>
                                                <input
                                                    type="radio"
                                                    name={`correct-${qIndex}`}
                                                    checked={question.correctOption === optIndex}
                                                    onChange={() => handleQuestionChange(qIndex, 'correctOption', optIndex)}
                                                />
                                                Option {optIndex + 1} {question.correctOption === optIndex && '(Correct)'}
                                            </label>
                                            <input
                                                type="text"
                                                value={option}
                                                onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                                                placeholder={`Option ${optIndex + 1}`}
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="btn btn-outline"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Test'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTest;
