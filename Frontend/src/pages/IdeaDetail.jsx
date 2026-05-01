import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import PostIdeaModal from '../components/PostIdeaModal';
import { STAGE_MAP, CATEGORY_ICONS } from '../components/IdeaCard';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function useToast() {
  const [toast, setToast] = useState({ msg: '', type: '', show: false });
  const show = (msg, type = 'success') => {
    setToast({ msg, type, show: true });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 2500);
  };
  return { toast, show };
}

function IdeaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const myUsername = localStorage.getItem('activeAccount') || '';

  const [idea, setIdea] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [sparked, setSparked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const { toast, show: showToast } = useToast();

  useEffect(() => {
    fetchIdea();
    fetchComments();
  }, [id]);

  const fetchIdea = async () => {
    setLoading(true);
    try {
      const res = await API.get(`ideas/${id}/`);
      setIdea(res.data);
    } catch {
      navigate('/explore');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await API.get(`ideas/${id}/comments/`);
      setComments(res.data);
    } catch {
    }
  };

  const handleSpark = async () => {
    try {
      const res = await API.post(`ideas/${id}/spark/`);
      setSparked(res.data.sparked);
      setIdea((prev) => ({ ...prev, sparks_count: res.data.sparks_count }));
    } catch {
      showToast('Could not spark idea', 'error');
    }
  };

  const handleSave = async () => {
    try {
      const res = await API.post(`ideas/${id}/save/`);
      setSaved(res.data.saved);
      showToast(res.data.saved ? 'Idea saved ⭐' : 'Removed from saved');
    } catch {
      showToast('Could not save idea', 'error');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await API.post(`ideas/${id}/comment/`, { text });
      setText('');
      fetchComments();
    } catch {
      showToast('Could not post comment', 'error');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-state"><div className="spinner" /> Loading idea…</div>
      </>
    );
  }

  if (!idea) return null;

  const stage = STAGE_MAP[idea.stage] || STAGE_MAP['raw'];
  const isOwner = myUsername === idea.user;

  return (
    <>
      <Navbar />

      <div className="detail-page">

        <button className="detail-back-btn" onClick={() => navigate('/explore')}>
          ← Back to Explore
        </button>
        <div className="detail-card">
          <div className="detail-card-top">
            <h1 className="detail-title">{idea.title}</h1>
          </div>
          <div className="detail-badges">
            <span className={stage.cls}>{stage.label}</span>
            <span className="badge badge-category">
              {CATEGORY_ICONS[idea.category] || '🔮'} {idea.category}
            </span>
          </div>

          {idea.tags && idea.tags.length > 0 && (
            <div className="detail-tags">
              {idea.tags.map((tag) => (
                <span key={tag} className="tag-chip">#{tag}</span>
              ))}
            </div>
          )}

          <p className="detail-desc">{idea.description}</p>
          <div className="detail-meta-row">
            <div className="detail-user-info">
              <div className="detail-avatar">
                {idea.user?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="detail-username">@{idea.user}</div>
                <div className="detail-date">{timeAgo(idea.created_at)}</div>
              </div>
            </div>

            <div className="detail-actions">
              {isOwner && (
                <button
                  className="spark-btn"
                  onClick={() => setShowEdit(true)}
                  style={{ borderColor: 'rgba(249,115,22,0.3)', color: 'var(--accent)' }}
                >
                  ✏️ Edit
                </button>
              )}

              {!isOwner && (
                <button
                  className={`spark-btn ${sparked ? 'sparked' : ''}`}
                  onClick={handleSpark}
                >
                  🔥 {sparked ? 'Sparked' : 'Spark It'} · {idea.sparks_count}
                </button>
              )}

              {isOwner && (
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  🔥 {idea.sparks_count} sparks
                </span>
              )}

              <button
                className={`save-btn ${saved ? 'saved' : ''}`}
                onClick={handleSave}
              >
                {saved ? '⭐ Saved' : '☆ Save'}
              </button>
            </div>
          </div>
        </div>

        {idea.contact && (
          <div className="connect-card">
            <h3>🤝 Connect with @{idea.user}</h3>
            <p>Interested in collaborating or getting guidance? Reach out directly:</p>
            <div className="contact-value">
              <span className="contact-icon">📬</span>
              {idea.contact.startsWith('http') ? (
                <a href={idea.contact} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>
                  {idea.contact}
                </a>
              ) : (
                <span>{idea.contact}</span>
              )}
            </div>
          </div>
        )}

        <div className="comments-section">
          <div className="comments-header">
            💬 Discussion ({comments.length})
          </div>

          <div className="comment-list">
            {comments.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                No comments yet — start the conversation!
              </p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="comment-item">
                  <div className="comment-avatar">
                    {c.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="comment-body">
                    <span className="comment-username">{c.username}</span>
                    <p className="comment-text">{c.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <form className="comment-form" onSubmit={handleComment}>
            <input
              className="comment-input"
              placeholder="Share your thoughts or feedback…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button type="submit" className="comment-submit">Post</button>
          </form>
        </div>
      </div>

      {showEdit && (
        <PostIdeaModal
          editIdea={idea}
          onClose={() => setShowEdit(false)}
          onSuccess={() => {
            fetchIdea();
            showToast('Idea updated! ✅');
          }}
        />
      )}
      <div className={`toast ${toast.type} ${toast.show ? 'show' : ''}`}>{toast.msg}</div>
    </>
  );
}

export default IdeaDetail;
