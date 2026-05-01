import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import IdeaCard from '../components/IdeaCard';
import PostIdeaModal from '../components/PostIdeaModal';

const STAGE_FILTERS = [
  { value: '', label: '✨ All Stages' },
  { value: 'raw', label: '💡 Raw Idea' },
  { value: 'progress', label: '🔧 In Progress' },
  { value: 'launch', label: '🚀 Ready to Launch' },
  { value: 'partner', label: '🤝 Looking for Partner' },
];

const CATEGORY_FILTERS = [
  { value: '', label: '🌐 All' },
  { value: 'tech', label: '💻 Tech' },
  { value: 'health', label: '🏥 Health' },
  { value: 'education', label: '📚 Education' },
  { value: 'finance', label: '💰 Finance' },
  { value: 'social', label: '🌍 Social' },
  { value: 'creative', label: '🎨 Creative' },
  { value: 'other', label: '🔮 Other' },
];

const SORT_OPTIONS = [
  { value: 'latest', label: '🕐 Latest' },
  { value: 'sparks', label: '🔥 Most Sparked' },
  { value: 'comments', label: '💬 Most Discussed' },
];

function useToast() {
  const [toast, setToast] = useState({ msg: '', type: '', show: false });
  const show = (msg, type = 'success') => {
    setToast({ msg, type, show: true });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 2500);
  };
  return { toast, show };
}

function Explore() {
  const [ideas, setIdeas] = useState([]);
  const [tags, setTags] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [tagFilter,   setTagFilter] = useState('');
  const [sort, setSort] = useState('latest');
  const [showModal, setShowModal] = useState(false);
  const { toast, show: showToast } = useToast();

  useEffect(() => {
    document.title = 'Explore | IdeaNest';
    fetchTags();
    fetchSavedIds();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchIdeas(), 300);
    return () => clearTimeout(timer);
  }, [search, stageFilter, catFilter, tagFilter, sort]);

  const fetchIdeas = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (stageFilter) params.append('stage', stageFilter);
      if (catFilter) params.append('category', catFilter);
      if (tagFilter) params.append('tag', tagFilter);
      if (sort) params.append('sort', sort);

      const res = await API.get(`ideas/?${params.toString()}`);
      setIdeas(res.data);
    } catch {
      showToast('Failed to load ideas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await API.get('ideas/tags/');
      setTags(res.data);
    } catch {
    }
  };

  const fetchSavedIds = async () => {
    try {
      const res = await API.get('ideas/saved/');
      const ids = new Set(res.data.map((s) => s.idea.id));
      setSavedIds(ids);
    } catch {
    }
  };

  const handleSaveToggle = () => {
    fetchSavedIds();
  };

  const clearFilters = () => {
    setSearch('');
    setStageFilter('');
    setCatFilter('');
    setTagFilter('');
    setSort('latest');
  };

  const hasActiveFilters = search || stageFilter || catFilter || tagFilter || sort !== 'latest';

  return (
    <>
      <Navbar />

      <div className="explore-page">
        <div className="explore-header">
          <h2>Explore Ideas 🔥</h2>
          <button className="btn-main" onClick={() => setShowModal(true)}>
            + Post Idea
          </button>
        </div>

        <div className="search-bar-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by title, description or tag…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Sort row */}
        <div className="sort-row">
          <span className="sort-label">Sort:</span>
          {SORT_OPTIONS.map((s) => (
            <button
              key={s.value}
              className={`sort-btn ${sort === s.value ? 'active' : ''}`}
              onClick={() => setSort(s.value)}
            >
              {s.label}
            </button>
          ))}
          {hasActiveFilters && (
            <button className="sort-btn" onClick={clearFilters} style={{ marginLeft: 'auto', color: 'var(--danger)' }}>
              ✕ Clear all
            </button>
          )}
        </div>

        {/* Stage filter */}
        <div className="filter-bar">
          {STAGE_FILTERS.map((f) => (
            <button
              key={f.value}
              className={`filter-btn ${stageFilter === f.value ? 'active' : ''}`}
              onClick={() => setStageFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="filter-bar">
          {CATEGORY_FILTERS.map((f) => (
            <button
              key={f.value}
              className={`filter-btn ${catFilter === f.value ? 'active' : ''}`}
              onClick={() => setCatFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {tags.length > 0 && (
          <div className="filter-bar">
            <button
              className={`filter-btn ${tagFilter === '' ? 'active' : ''}`}
              onClick={() => setTagFilter('')}
            >
              🏷 All Tags
            </button>
            {tags.slice(0, 20).map((t) => (
              <button
                key={t.id}
                className={`filter-btn ${tagFilter === t.name ? 'active' : ''}`}
                onClick={() => setTagFilter(t.name)}
              >
                #{t.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="loading-state"><div className="spinner" /> Loading ideas…</div>
        ) : ideas.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">💭</span>
            <p>No ideas found. Try different filters or be the first to post!</p>
          </div>
        ) : (
          <div className="ideas-grid">
            {ideas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onSave={handleSaveToggle}
                savedIds={savedIds}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <PostIdeaModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { fetchIdeas(); fetchTags(); showToast('Idea posted! 🎉'); }}
        />
      )}

      <div className={`toast ${toast.type} ${toast.show ? 'show' : ''}`}>{toast.msg}</div>
    </>
  );
}

export default Explore;
