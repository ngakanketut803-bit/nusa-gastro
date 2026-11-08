import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Menu, Phone, X } from 'lucide-react';
import { publicAsset } from '../lib/publicAsset';

export default function SiteHeader({ username, onLogin, onProfileToggle, profileOpen, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const goToSection = (id) => {
    setMenuOpen(false);
    if (location.pathname !== '/' && location.pathname !== '/home') navigate('/home');
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="gg-site-header">
      <div className="gg-site-header-inner">
        <Link className="gg-brand" to="/home" onClick={closeMenu} aria-label="Nusa Gastro AI, beranda">
          <img className="gg-brand-mark gg-brand-logo" src={publicAsset('nusa-gastro-assets/logo.png')} alt="" />
          <span className="gg-brand-name"><b>Nusa Gastro <em>AI</em></b><small>Kesehatan perjalanan</small></span>
        </Link>

        <nav className={`gg-site-links ${menuOpen ? 'is-open' : ''}`} aria-label="Navigasi utama">
          <NavLink to="/predict" onClick={closeMenu}>Gastro Predict</NavLink>
          <NavLink to="/scan" onClick={closeMenu}>Food Scan</NavLink>
          <button type="button" onClick={() => goToSection('herbal')}>Panduan herbal</button>
          <NavLink to="/gastrobot" onClick={closeMenu}>GastroBot</NavLink>
          <a className="gg-mobile-emergency" href="tel:112" onClick={closeMenu}><Phone size={15}/> Darurat 112</a>
        </nav>

        <div className="gg-site-actions">
          <a className="gg-emergency" href="tel:112"><Phone size={15}/><span>Darurat 112</span></a>
          {onLogin && <button className="gg-account-button" type="button" aria-label={username ? `Profil ${username}` : 'Masuk ke akun'} title={username ? `Profil ${username}` : 'Masuk'} onClick={username ? onProfileToggle : onLogin}>
            <span>{username ? username.slice(0, 1).toUpperCase() : 'Masuk'}</span>
          </button>}
          <button className="gg-header-cta" type="button" onClick={() => navigate('/predict')}>Mulai jelajah <ArrowUpRight size={15}/></button>
          <button className="gg-menu-toggle" type="button" aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X size={21}/> : <Menu size={21}/>}
          </button>
          {profileOpen && <div className="gg-profile-menu"><b>{username}</b><small>Akun ini menyimpan riwayat konseling di perangkat.</small><button className="gg-logout" onClick={onLogout}>Keluar akun</button></div>}
        </div>
      </div>
    </header>
  );
}
