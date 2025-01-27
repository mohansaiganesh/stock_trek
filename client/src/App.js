import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import SearchHome from './components/SearchHome';
import Search from './components/Search';
import Watchlist from './components/Watchlist';
import Portfolio from './components/Portfolio';

function App() {
  const location = useLocation();
  const [lastSearchedQuery, setLastSearchedQuery] = useState('');

  useEffect(() => {
    const getLastSearchedQuery = () => {
      const pathname = location.pathname;
      const parts = pathname.split('/');
      if (parts.length >= 3 && parts[1] === 'search') {
        return parts[2];
      }
      return '';
    };

    if (location.pathname.startsWith('/search')) {
      setLastSearchedQuery(getLastSearchedQuery());
    }
    else if (location.pathname === '/') {
      setLastSearchedQuery('');
    }
  }, [location.pathname]);

  const searchLink = lastSearchedQuery ? `/search/${lastSearchedQuery}` : '/';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <nav className="navbar navbar-expand-lg navbar-dark sticky-top m-0 p-0" style={{ fontFamily : 'Arial', backgroundColor: 'rgb(25, 35, 155)' }}>
        <div className="container-fluid">
          <p className="navbar-brand mx-4 pt-3">Stock Search</p>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo02" aria-controls="navbarTogglerDemo02" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse justify-content-end" id="navbarTogglerDemo02">
            <div className="d-flex flex-column flex-lg-row">
              <ul className="navbar-nav mx-4 py-2">
                <li className={`nav-item ${location.pathname === searchLink || location.pathname === '/'  ? 'active border border-2 rounded-4' : 'active'}`}>
                  <Link to={searchLink} className="nav-link"><span className="px-2">Search</span></Link>
                </li>
                <li className={`nav-item ${location.pathname === '/watchlist' ? 'active border border-2 rounded-4' : 'active'}`}>
                  <Link to="/watchlist" className="nav-link "><span className="px-2">Watchlist</span></Link>
                </li>
                <li className={`nav-item ${location.pathname === '/portfolio' ? 'active border border-2 rounded-4' : 'active'}`}>
                  <Link to="/portfolio" className="nav-link"><span className="px-2">Portfolio</span></Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <div className="container-fluid mb-5 m-0 p-0" style={{ flex: '1 0 auto' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/search/home" replace />} />
          <Route path="/search/home"  element={<SearchHome />}/>
          <Route path="/search/:query" element={<Search />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/portfolio" element={<Portfolio />} />
        </Routes>
      </div>
      <footer className="footer py-3 text-center" style={{ backgroundColor: 'rgb(220, 220, 220)', flexShrink: '0' }}>
        <div className="container">
            <strong>Powered by <a href="https://finnhub.io" rel="noreferrer" target="_blank">Finnhub.io </a></strong>
        </div>
      </footer>
    </div>
  );
}

export default App;