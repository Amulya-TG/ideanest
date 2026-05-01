import { useState, useEffect } from 'react';
import API from '../api/axios';

const STAGES = [
  { value: 'raw', label: '💡 Raw Idea' },
  { value: 'progress', label: '🔧 In Progress' },
  { value: 'launch', label: '🚀 Ready to Launch' },
  { value: 'partner', label: '🤝 Looking for Partner' },
];

const CATEGORIES = [
  { value: 'tech', label: '💻 Tech' },
  { value: 'health', label: '🏥 Health' },
  { value: 'education', label: '📚 Education' },
  { value: 'finance', label: '💰 Finance' },
  { value: 'social', label: '🌍 Social Impact' },
  { value: 'creative', label: '🎨 Creative' },
  { value: 'other', label: '🔮 Other' },
];

function PostIdeaModal({ onClose, onSuccess, editIdea }) {
  const isEditMode = Boolean(editIdea);

  const [title,  setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stage, setStage] = useState('raw');
  const [category, setCategory] = useState('other');
  const [contact, setContact] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editIdea) {
      setTitle(editIdea.title || '');
      setDescription(editIdea.description || '');
      setStage(editIdea.stage || 'raw');
      setCategory(editIdea.category || 'other');
      setContact(editIdea.contact || '');
      setTagsInput(Array.isArray(editIdea.tags) ? editIdea.tags.join(', ') : '');
    }
  }, [editIdea]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!description.trim()) {
      setError('Description is required.');
      return;
    }
    setError('');
    setLoading(true);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      stage,
      category,
      contact: contact.trim(),
      tags_input: tagsInput.trim(),
    };

    try {
      if (isEditMode) {
        await API.put(`ideas/${editIdea.id}/edit/`, payload);
      } else {
        await API.post('ideas/create/', payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        const messages = Object.entries(data.errors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(' | ');
        setError(messages);
      } else if (data?.detail) {
        setError(data.detail);
      } else if (err.response?.status === 401) {
        setError('You must be logged in to post an idea.');
      } else {
        setError('Failed to save idea. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <h3>{isEditMode ? '✏️ Edit Idea' : '💡 Post Your Idea'}</h3>

        <div className="modal-field">
          <label className="modal-label">Title *</label>
          <input
            className="modal-input"
            placeholder="Give your idea a clear title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={150}
          />
        </div>

        <div className="modal-field">
          <label className="modal-label">Description *</label>
          <textarea
            className="modal-textarea"
            placeholder="Describe your idea — what problem does it solve? Who is it for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
          />
        </div>

        <div className="modal-field">
          <label className="modal-label">Stage</label>
          <select
            className="modal-select"
            value={stage}
            onChange={(e) => setStage(e.target.value)}
          >
            {STAGES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="modal-field">
          <label className="modal-label">Category</label>
          <select
            className="modal-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="modal-field">
          <label className="modal-label">Tags</label>
          <input
            className="modal-input"
            placeholder="AI, SaaS, Mobile  (comma separated, optional)"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />
          <p className="modal-hint">Up to 10 tags help others discover your idea.</p>
        </div>

        <div className="modal-field">
          <label className="modal-label">Contact / Collaborate Link</label>
          <input
            className="modal-input"
            placeholder="your@email.com or linkedin.com/in/you  (optional)"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
        </div>

        {error && (
          <p className="auth-error" style={{ marginTop: 12, textAlign: 'left', fontSize: 13 }}>
            ⚠️ {error}
          </p>
        )}

        <div className="modal-actions">
          <button className="btn-cancel" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving…' : isEditMode ? 'Save Changes' : 'Post Idea'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostIdeaModal;
