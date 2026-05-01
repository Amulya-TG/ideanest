import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const STAGE_MAP = {
  raw: { cls: 'badge badge-stage-raw', label: '💡 Raw Idea' },
  progress: { cls: 'badge badge-stage-progress', label: '🔧 In Progress' },
  launch: { cls: 'badge badge-stage-launch', label: '🚀 Ready to Launch' },
  partner: { cls: 'badge badge-stage-partner', label: '🤝 Looking for Partner' },
};

const CATEGORY_ICONS = {
  tech:'💻', health:'🏥', education:'📚',
  finance:'💰', social:'🌍', creative:'🎨', other:'🔮',
};

function IdeaCard({ idea, onSave, savedIds }) {
  const navigate = useNavigate();
  const stage = STAGE_MAP[idea.stage] || STAGE_MAP['raw'];
  const isSaved  = savedIds ? savedIds.has(idea.id) : false;

  const handleSave = async (e) => {
    e.stopPropagation();
    try {
      await API.post(`ideas/${idea.id}/save/`);
      if (onSave) onSave();
    } catch {
    }
  };

  return (
    <div className="idea-card" onClick={() => navigate(`/idea/${idea.id}`)}>
      <div className="idea-card-top">
        <h3 className="idea-card-title">{idea.title}</h3>
        <span className={stage.cls}>{stage.label}</span>
      </div>

      <p className="idea-card-desc">{idea.description}</p>
      {idea.tags && idea.tags.length > 0 && (
        <div className="idea-card-tags">
          {idea.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="tag-chip">#{tag}</span>
          ))}
        </div>
      )}

      <div className="idea-card-footer">
        <div className="idea-card-meta">
          <span className="badge badge-category">
            {CATEGORY_ICONS[idea.category] || '🔮'} {idea.category}
          </span>
          <span className="idea-card-user">@{idea.user}</span>
        </div>

        <div className="idea-card-stats">
          <span className="stat-pill">🔥 {idea.sparks_count}</span>
          <span className="stat-pill">💬 {idea.comments_count ?? idea.comments?.length ?? 0}</span>
          <button
            className={`card-save-btn ${isSaved ? 'saved' : ''}`}
            onClick={handleSave}
            title={isSaved ? 'Remove bookmark' : 'Save idea'}
          >
            {isSaved ? '⭐' : '☆'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default IdeaCard;
export { STAGE_MAP, CATEGORY_ICONS };
