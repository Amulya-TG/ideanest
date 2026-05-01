import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import IdeaCard from '../components/IdeaCard';
import API from '../api/axios';

function Home() {
  const navigate = useNavigate();
  const [trending, setTrending] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  useEffect(() => {
    document.title = 'Home | IdeaNest';
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      const res = await API.get('ideas/trending/');
      setTrending(res.data);
    } catch {
      // fail silently — trending is not critical
    } finally {
      setLoadingTrending(false);
    }
  };

  return (
    <div className="home-page">
      <Navbar />

      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">🚀 Built for Builders & Dreamers</div>

        <h1>
          Where Great <span>Ideas</span><br />Find Their Team
        </h1>

        <p>
          Post your startup idea, project concept, or business vision.
          Explore what others are building. Connect and collaborate.
        </p>

        <div className="hero-btns">
          <button className="btn-main" onClick={() => navigate('/explore')}>
            Explore Ideas
          </button>
          <button className="btn-ghost" onClick={() => navigate('/profile')}>
            Post Your Idea
          </button>
        </div>
      </section>

      {/* Trending Ideas */}
      <section className="trending-section">
        <h2 className="section-title">🔥 Trending Right Now</h2>

        {loadingTrending ? (
          <div className="loading-state"><div className="spinner" /> Loading…</div>
        ) : trending.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">💭</span>
            <p>No ideas yet — be the first to post!</p>
          </div>
        ) : (
          <div className="trending-grid">
            {trending.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="how-it-works">
        <h2 className="section-title">How IdeaNest Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <span className="step-icon">💡</span>
            <h3>Post Your Idea</h3>
            <p>Share your startup idea, project or business concept. Set a stage and add tags so others can find it.</p>
          </div>
          <div className="step-card">
            <span className="step-icon">🔍</span>
            <h3>Explore & Discover</h3>
            <p>Search by title or tag. Filter by category and stage. Sort by latest, most sparked, or most discussed.</p>
          </div>
          <div className="step-card">
            <span className="step-icon">🤝</span>
            <h3>Connect & Collaborate</h3>
            <p>Spark ideas you love. Save them for later. Reach out to creators directly to collaborate.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;