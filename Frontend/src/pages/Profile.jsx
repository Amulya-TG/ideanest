import { useEffect, useState } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import IdeaCard from '../components/IdeaCard';
import PostIdeaModal from '../components/PostIdeaModal';

function useToast() {
  const [toast, setToast] = useState({ msg: '', type: '', show: false });
  const show = (msg, type = 'success') => {
    setToast({ msg, type, show: true });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 2500);
  };
  return { toast, show };
}

function ConfirmDelete({ onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 340 }}>
        <span className="confirm-icon">🗑️</span>
        <h3 style={{ textAlign: 'center' }}>Delete Idea?</h3>
        <p className="confirm-text">
          This idea will be permanently removed and cannot be recovered.
        </p>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn-danger"  onClick={onConfirm}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

function Profile() {
  const username = localStorage.getItem('activeAccount') || 'You';

  // Profile stats
  const [stats,       setStats]       = useState({ bio: '', total_ideas: 0, total_sparks: 0, saved_count: 0 });

  // Data
  const [myIdeas,     setMyIdeas]     = useState([]);
  const [savedIdeas,  setSavedIdeas]  = useState([]);

  // UI state
  const [activeTab,   setActiveTab]   = useState('ideas');  // 'ideas' | 'saved'
  const [loading,     setLoading]     = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [editIdea,    setEditIdea]    = useState(null);      // idea being edited
  const [deleteId,    setDeleteId]    = useState(null);

  // Bio editing
  const [editingBio,  setEditingBio]  = useState(false);
  const [bioInput,    setBioInput]    = useState('');

  const { toast, show: showToast } = useToast();

  useEffect(() => {
    document.title = 'My Board | IdeaNest';
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [profileRes, ideasRes, savedRes] = await Promise.all([
        API.get('users/profile/'),
        API.get('ideas/my-ideas/'),
        API.get('ideas/saved/'),
      ]);
      setStats(profileRes.data);
      setBioInput(profileRes.data.bio || '');
      setMyIdeas(ideasRes.data);
      setSavedIdeas(savedRes.data);
    } catch {
      showToast('Could not load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`ideas/${deleteId}/delete/`);
      setMyIdeas((prev) => prev.filter((i) => i.id !== deleteId));
      setStats((s) => ({ ...s, total_ideas: s.total_ideas - 1 }));
      showToast('Idea deleted');
    } catch {
      showToast('Failed to delete idea', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const handleBioSave = async () => {
    try {
      await API.put('users/profile/update/', { bio: bioInput });
      setStats((s) => ({ ...s, bio: bioInput }));
      setEditingBio(false);
      showToast('Bio updated!');
    } catch {
      showToast('Failed to update bio', 'error');
    }
  };

  const handleUnsave = async (ideaId) => {
    try {
      await API.post(`ideas/${ideaId}/save/`);   // toggle removes it
      setSavedIdeas((prev) => prev.filter((s) => s.idea.id !== ideaId));
      setStats((s) => ({ ...s, saved_count: s.saved_count - 1 }));
      showToast('Removed from saved');
    } catch {
      showToast('Failed to unsave', 'error');
    }
  };

  // savedIds set for IdeaCard bookmark icon
  const savedIds = new Set(savedIdeas.map((s) => s.idea.id));

  return (
    <>
      <Navbar />

      <div className="profile-page">

        {/* Profile header */}
        <div className="profile-header-card">
          <div className="profile-avatar-big">
            {username.charAt(0).toUpperCase()}
          </div>

          <div className="profile-info">
            <div className="profile-username">@{username}</div>

            {/* Bio */}
            {editingBio ? (
              <div className="bio-edit-form">
                <textarea
                  className="bio-textarea"
                  rows={2}
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  maxLength={300}
                  placeholder="Write something about yourself…"
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button className="btn-primary" style={{ padding: '7px 14px', fontSize: 13 }} onClick={handleBioSave}>Save</button>
                  <button className="btn-cancel"  style={{ padding: '7px 14px', fontSize: 13 }} onClick={() => setEditingBio(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <p className="profile-bio">
                {stats.bio || 'No bio yet.'}
                <button className="profile-bio-edit" onClick={() => setEditingBio(true)}>
                  &nbsp;✏️ Edit
                </button>
              </p>
            )}

            {/* Stats */}
            <div className="profile-stats-row">
              <div className="profile-stat">
                <span className="profile-stat-num">{stats.total_ideas}</span>
                <span className="profile-stat-label">Ideas</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-num">{stats.total_sparks}</span>
                <span className="profile-stat-label">Sparks</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-num">{stats.saved_count}</span>
                <span className="profile-stat-label">Saved</span>
              </div>
            </div>

            <div className="profile-actions">
              <button className="btn-main" onClick={() => { setEditIdea(null); setShowModal(true); }}>
                + Post New Idea
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeTab === 'ideas' ? 'active' : ''}`}
            onClick={() => setActiveTab('ideas')}
          >
            💡 My Ideas ({myIdeas.length})
          </button>
          <button
            className={`profile-tab ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            ⭐ Saved ({savedIdeas.length})
          </button>
        </div>

        {/* My Ideas tab */}
        {activeTab === 'ideas' && (
          loading ? (
            <div className="loading-state"><div className="spinner" /> Loading…</div>
          ) : myIdeas.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">💭</span>
              <p>You haven't posted any ideas yet. Share your first one!</p>
            </div>
          ) : (
            <div className="my-ideas-list">
              {myIdeas.map((idea) => (
                <div key={idea.id} style={{ position: 'relative' }}>
                  <IdeaCard idea={idea} savedIds={savedIds} />

                  {/* Owner action buttons */}
                  <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 8, zIndex: 2 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditIdea(idea); setShowModal(true); }}
                      style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)', color: 'var(--accent)', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteId(idea.id); }}
                      style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)', color: 'var(--danger)', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Saved Ideas tab */}
        {activeTab === 'saved' && (
          loading ? (
            <div className="loading-state"><div className="spinner" /> Loading…</div>
          ) : savedIdeas.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">⭐</span>
              <p>No saved ideas yet. Bookmark ideas you want to revisit!</p>
            </div>
          ) : (
            <div className="my-ideas-list">
              {savedIdeas.map((s) => (
                <div key={s.id} style={{ position: 'relative' }}>
                  <IdeaCard idea={s.idea} savedIds={savedIds} onSave={() => handleUnsave(s.idea.id)} />
                  <button
                    onClick={() => handleUnsave(s.idea.id)}
                    style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)', color: 'var(--gold)', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', zIndex: 2 }}
                  >
                    ✕ Unsave
                  </button>
                </div>
              ))}
            </div>
          )
        )}

      </div>

      {/* Post / Edit modal */}
      {showModal && (
        <PostIdeaModal
          editIdea={editIdea}
          onClose={() => { setShowModal(false); setEditIdea(null); }}
          onSuccess={() => {
            fetchAll();
            showToast(editIdea ? 'Idea updated! ✅' : 'Idea posted! 🎉');
          }}
        />
      )}

      {/* Confirm delete */}
      {deleteId && (
        <ConfirmDelete
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}

      <div className={`toast ${toast.type} ${toast.show ? 'show' : ''}`}>{toast.msg}</div>
    </>
  );
}

export default Profile;
