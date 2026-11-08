import { NavLink, useNavigate } from 'react-router-dom';
import { Activity, Camera, Home, Leaf, MessageCircle } from 'lucide-react';
import './BottomNav.css';

const BottomNav = () => {
    const navigate = useNavigate();
    const openHerbalGuide = () => {
        navigate('/home');
        window.setTimeout(() => document.getElementById('herbal')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    };

    return (
        <nav className="bottom-nav" aria-label="Navigasi utama">
            <NavLink end to="/home" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Home aria-hidden="true"/><span>Beranda</span>
            </NavLink>
            <NavLink to="/predict" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Activity aria-hidden="true"/><span>Prediksi</span>
            </NavLink>
            <NavLink to="/scan" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Camera aria-hidden="true"/><span>Food Scan</span>
            </NavLink>
            <button type="button" className="nav-item" onClick={openHerbalGuide}>
                <Leaf aria-hidden="true"/><span>Herbal</span>
            </button>
            <NavLink to="/gastrobot" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <MessageCircle aria-hidden="true"/><span>Nusa Bot</span>
            </NavLink>
        </nav>
    );
};

export default BottomNav;
