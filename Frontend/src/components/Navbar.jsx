import { Link, useLocation, useNavigate } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const username = localStorage.getItem('activeAccount') || '';

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('activeAccount');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <span className="nav-logo">Idea<span>Nest</span></span>

      <div className="nav-links">
        <Link to="/home" className={isActive('/home')}>Home</Link>
        <Link to="/explore" className={isActive('/explore')}>Explore</Link>
        <Link to="/profile" className={isActive('/profile')}>My Board</Link>
      </div>

      <div className="nav-user">
        <span className="nav-username">@{username}</span>
        <button className="nav-logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
