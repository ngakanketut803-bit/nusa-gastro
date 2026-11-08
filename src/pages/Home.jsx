import { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Check, ClipboardCheck, HeartPulse, MapPin, MessageCircle, Phone, ShieldCheck, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import GastroBot from '../components/GastroBot';
import ClinicLocator from '../components/ClinicLocator';
import HerbalGuide from '../components/HerbalGuide';
import GutDefender from '../components/GutDefender';
import SiteHeader from '../components/SiteHeader';
import { publicAsset } from '../lib/publicAsset';
import './Home.css';

const checklistItems = ['Oralit / P3K cerna', 'Air minum kemasan tersegel', 'Obat pribadi & anti-mual', 'Probiotik (opsional)', 'Tisu & hand sanitizer'];

export default function Home() {
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [checked, setChecked] = useState({});
  const [username, setUsername] = useState(() => localStorage.getItem('moodify_currentUser') || '');
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginName, setLoginName] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(() => localStorage.getItem('gastroguard_welcome_seen') !== '1');

  const goToSection = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const handleLogin = (event) => {
    event.preventDefault();
    const name = loginName.trim();
    if (!name || !privacyAccepted) { setLoginError('Masukkan nama dan setujui pemberitahuan privasi.'); return; }
    localStorage.setItem('moodify_currentUser', name);
    const key = `moodify_data_${name}`;
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ joinedAt: new Date().toISOString(), chatHistory: [], profile: 'traveler' }));
    setUsername(name);
    setLoginOpen(false);
    setLoginError('');
  };
  const logout = () => {
    localStorage.removeItem('moodify_currentUser');
    setUsername('');
    setProfileOpen(false);
  };

  return (
    <div className="gg-app">
      <SiteHeader
        username={username}
        onLogin={() => setLoginOpen(true)}
        onProfileToggle={() => setProfileOpen((open) => !open)}
        profileOpen={profileOpen}
        onLogout={logout}
      />

      <main id="top" className="gg-home-main">
        <section className="gg-hero gg-hero-editorial" aria-labelledby="hero-title">
          <div className="gg-hero-copy">
            <span className="gg-eyebrow"><ShieldCheck size={15}/> KESEHATAN PERJALANAN · INDONESIA</span>
            <h1 id="hero-title">Nikmati perjalanan.<br/><span>Jaga pencernaan.</span></h1>
            <p>Asisten cerdas untuk menjaga kesehatan pencernaan dan keamanan pangan di setiap perjalanan.</p>
            <div className="gg-hero-actions">
              <Link className="gg-button gg-button-primary" to="/predict">Rencanakan dengan Nusa Predict <ArrowUpRight size={16}/></Link>
              <button className="gg-text-link" type="button" onClick={() => goToSection('tools')}>Lihat semua panduan <ArrowDownRight size={16}/></button>
            </div>
            <div className="gg-trust"><span><i/> Panduan preventif</span><span><i/> Dibuat untuk pelancong tropis</span></div>
          </div>
          <figure className="gg-hero-visual">
            <img src={publicAsset('nusa-gastro-assets/cover.png')} alt="Tenaga kesehatan dan pelancong bersama menjaga kesehatan selama perjalanan" />
            <figcaption><MapPin size={15}/><span>Bekal informasi untuk pilihan yang lebih tenang.</span></figcaption>
          </figure>
        </section>

        <section className="gg-welcome-row" aria-label="Sapaan">
          <div><span className="gg-kicker">PANDUAN UNTUK PERJALANANMU</span><h2>{username ? `Halo, ${username}` : 'Halo, traveler'} <HeartPulse size={18}/></h2><p>Bekal pintar untuk menjaga perut tetap nyaman selama menjelajah.</p></div>
          <div className="gg-weather"><span className="gg-weather-icon"><MapPin size={19}/></span><span><b>Bali · Tropis</b><small>Prakiraan cuaca belum terhubung</small></span></div>
        </section>

        <section className="gg-editorial-intro" aria-labelledby="intro-title">
          <span className="gg-kicker">BERANGKAT DENGAN LEBIH SIAP</span>
          <h2 id="intro-title">Informasi kesehatan yang membantu kamu tetap hadir di setiap perjalanan.</h2>
          <p>Nusa Gastro menyatukan panduan keamanan pangan, kesehatan pencernaan, dan informasi perjalanan dalam satu tempat. Pilih alat yang kamu perlukan, lalu gunakan hasilnya sebagai bekal bertanya dan mengambil keputusan.</p>
          <a href="#tools" className="gg-inline-link" onClick={(event) => { event.preventDefault(); goToSection('tools'); }}>Kenali alat Nusa Gastro <ArrowDownRight size={16}/></a>
        </section>

        <section id="tools" className="gg-toolkit" aria-labelledby="tools-title">
          <div className="gg-toolkit-heading">
            <div><span className="gg-kicker">PILIH ASISTEN PERJALANANMU</span><h2 id="tools-title">Dukungan kecil, untuk keputusan sehari-hari.</h2></div>
            <p>Alat praktis untuk merencanakan perjalanan, memilih makanan, dan mendapatkan bantuan.</p>
          </div>
          <div className="gg-tool-list">
            <Link to="/predict" className="gg-tool-row"><span className="gg-tool-index">01</span><img src={publicAsset('nusa-gastro-assets/features/gastro-predict.png')} alt=""/><span className="gg-tool-copy"><b>Nusa Predict</b><small>Model ARIMAX dan faktor risiko destinasi</small></span><ArrowUpRight size={19}/></Link>
            <button type="button" className="gg-tool-row" onClick={() => navigate('/scan')}><span className="gg-tool-index">02</span><img src={publicAsset('nusa-gastro-assets/features/food-scan.png')} alt=""/><span className="gg-tool-copy"><b>Food Scan</b><small>Panduan memilih sajian lokal</small></span><ArrowUpRight size={19}/></button>
            <button type="button" className="gg-tool-row" onClick={() => goToSection('herbal')}><span className="gg-tool-index">03</span><img src={publicAsset('nusa-gastro-assets/features/herbal-kearifan-lokal.png')} alt=""/><span className="gg-tool-copy"><b>Herbal & kearifan lokal</b><small>Panduan tradisional dan kehati-hatian</small></span><ArrowUpRight size={19}/></button>
            <Link to="/gastrobot" className="gg-tool-row"><span className="gg-tool-index">04</span><img src={publicAsset('nusa-gastro-assets/features/gastrobot.png')} alt=""/><span className="gg-tool-copy"><b>Nusa Bot</b><small>Konseling pencernaan dan pertolongan awal</small></span><ArrowUpRight size={19}/></Link>
            <button type="button" className="gg-tool-row" onClick={() => goToSection('gastrobot')}><span className="gg-tool-index">05</span><img src={publicAsset('nusa-gastro-assets/features/rumah-sakit-terdekat.png')} alt=""/><span className="gg-tool-copy"><b>Rumah Sakit &amp; Puskesmas Terdekat</b><small>Temukan layanan kesehatan di sekitar</small></span><ArrowUpRight size={19}/></button>
            <Link to="/games" className="gg-tool-row"><span className="gg-tool-index">06</span><img src={publicAsset('nusa-gastro-assets/features/games-pasang-jawaban.png')} alt=""/><span className="gg-tool-copy"><b>Games</b><small>Permainan ringan untuk menemani perjalanan</small></span><ArrowUpRight size={19}/></Link>
          </div>
        </section>

        <section id="scan" className="gg-section gg-scan-section">
          <div className="gg-section-head"><div><span className="gg-kicker">02 / FOOD SCAN</span><h2>Pilih makanan dengan lebih yakin</h2><p>Pindai foto, cocokkan dengan katalog makanan, dan pelajari cara memilih hidangan yang lebih aman.</p></div><span className="gg-section-icon orange gg-section-image"><img src={publicAsset('nusa-gastro-assets/features/food-scan.png')} alt="" /></span></div>
          <div className="gg-card gg-scan-launch"><img className="gg-scan-launch-icon" src={publicAsset('nusa-gastro-assets/features/food-scan.png')} alt="" /><div><b>Analisis hidangan dari foto atau katalog</b><p>Food Scan membandingkan hasil identifikasi visual dengan data gizi terverifikasi. Foto tidak dapat memastikan keamanan mikrobiologis makanan.</p></div><Link className="gg-button gg-button-teal" to="/scan">Buka Food Scan <ArrowUpRight size={16}/></Link></div>
        </section>

        <section id="herbal" className="gg-section gg-herbal-section">
          <div className="gg-section-head"><div><span className="gg-kicker">03 / KEARIFAN LOKAL</span><h2>Herbal & kenyamanan pencernaan</h2><p>Kenali penggunaan tradisional beserta batas bukti dan kewaspadaannya.</p></div><span className="gg-section-icon gg-section-image"><img src={publicAsset('nusa-gastro-assets/features/herbal-kearifan-lokal.png')} alt="" /></span></div>
          <HerbalGuide/>
        </section>

        <section id="gastrobot" className="gg-section gg-assistance-section">
          <div className="gg-section-head"><div><span className="gg-kicker">04 / BANTUAN PERJALANAN</span><h2>Pertolongan awal & bantuan terdekat</h2><p>Chatbot berbasis AI dan pencarian layanan kesehatan di sekitar.</p></div><span className="gg-section-icon coral gg-section-image"><img src={publicAsset('nusa-gastro-assets/features/gastrobot.png')} alt="" /></span></div>
          <div className="gg-bot-grid"><GastroBot/><ClinicLocator/></div>
        </section>

        <section className="gg-bottom-grid gg-preparation-section" aria-label="Persiapan perjalanan dan edukasi">
          <div className="gg-card gg-check-card">
            <div className="gg-mini-head"><span className="gg-section-icon"><ClipboardCheck size={18}/></span><div><span className="gg-kicker">SEBELUM BERANGKAT</span><h3>Bekal pencernaan</h3></div><span className="gg-check-count">{Object.values(checked).filter(Boolean).length}/{checklistItems.length}</span></div>
            <div className="gg-check-list">{checklistItems.map((item) => <label key={item} className={checked[item] ? 'done' : ''}><button type="button" aria-label={`${checked[item] ? 'Hapus centang' : 'Tandai'} ${item}`} aria-pressed={Boolean(checked[item])} onClick={() => setChecked((state) => ({ ...state, [item]: !state[item] }))}>{checked[item] && <Check size={13}/>}</button>{item}</label>)}</div>
          </div>
          <GutDefender/>
        </section>

        <section className="gg-closing-cta" aria-labelledby="closing-title">
          <div><span className="gg-kicker">SATU LANGKAH SEBELUM BERANGKAT</span><h2 id="closing-title">Mulai dari pilihan yang ingin kamu pahami.</h2><p>Gunakan informasi yang tersedia sebagai panduan, dan hubungi tenaga kesehatan untuk keluhan yang membutuhkan pemeriksaan.</p></div>
          <div className="gg-closing-actions"><Link className="gg-button gg-button-light" to="/scan">Jelajahi Food Scan <ArrowUpRight size={16}/></Link><Link className="gg-closing-text" to="/gastrobot">Tanya Nusa Bot <MessageCircle size={16}/></Link></div>
        </section>
      </main>

      <footer className="gg-footer gg-site-footer">
        <Link className="gg-brand" to="/home"><img className="gg-brand-mark gg-brand-logo" src={publicAsset('nusa-gastro-assets/logo.png')} alt=""/><span className="gg-brand-name"><b>Nusa Gastro</b><small>Kesehatan perjalanan</small></span></Link>
        <p>Informasi bersifat edukatif dan tidak menggantikan diagnosis atau perawatan tenaga kesehatan profesional.</p>
        <div className="gg-footer-links"><Link to="/predict">Nusa Predict</Link><Link to="/scan">Food Scan</Link><Link to="/gastrobot">Nusa Bot</Link><a href="tel:112"><Phone size={14}/> Darurat 112</a></div>
        <span>© 2026 Nusa Gastro</span>
      </footer>

      {welcomeOpen && <div className="gg-welcome-overlay" role="presentation"><section className="gg-welcome-modal" role="dialog" aria-modal="true" aria-labelledby="gg-welcome-title"><img src={publicAsset('nusa-gastro-assets/logo.png')} alt="Logo Nusa Gastro"/><span className="gg-kicker">TEMAN PERJALANAN</span><h2 id="gg-welcome-title">Selamat datang di Nusa Gastro</h2><p>Teman perjalanan untuk membantu menjaga kesehatan pencernaan, memilih makanan, dan menemukan edukasi yang relevan.</p><button onClick={() => { localStorage.setItem('gastroguard_welcome_seen', '1'); setWelcomeOpen(false); }}>Mulai jelajahi <ArrowUpRight size={16}/></button><small>Informasi di sini bersifat edukatif dan bukan pengganti saran tenaga kesehatan.</small></section></div>}

      {loginOpen && <div className="gg-login-overlay" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setLoginOpen(false); }}><form className="gg-login-card" onSubmit={handleLogin}><button type="button" className="gg-login-close" aria-label="Tutup" onClick={() => setLoginOpen(false)}><X size={17}/></button><img className="gg-brand-mark gg-brand-logo" src={publicAsset('nusa-gastro-assets/logo.png')} alt=""/><span className="gg-kicker">AKUN NUSA GASTRO</span><h2>Selamat datang, traveler</h2><p>Masuk menggunakan nama panggilan untuk menyimpan riwayat konseling pada perangkat ini.</p><label>Nama panggilan<input value={loginName} onChange={(event) => setLoginName(event.target.value)} placeholder="Nama kamu" autoComplete="nickname"/></label><label className="gg-privacy-check"><input type="checkbox" checked={privacyAccepted} onChange={(event) => setPrivacyAccepted(event.target.checked)}/>Saya memahami riwayat konseling disimpan secara lokal pada perangkat ini.</label>{loginError && <small className="gg-login-error" role="alert">{loginError}</small>}<button className="gg-login-submit" type="submit">Masuk / Buat profil</button></form></div>}
    </div>
  );
}
