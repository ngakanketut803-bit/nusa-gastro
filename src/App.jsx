import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import PredictionPage from './pages/PredictionPage';
import GastroBotPage from './pages/GastroBotPage';
import Scan from './pages/Scan';
import JoyGame from './pages/JoyGame';
import GamesMenu from './pages/GamesMenu';
import { ThemeProvider } from './context/ThemeContext';
import BottomNav from './components/BottomNav';
import './index.css';
import './styles/redesign.css';
import './styles/night-mode.css';

function AppLayout() {
  const location = useLocation();
  return <>
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/home" element={<Home/>}/>
      <Route path="/predict" element={<PredictionPage/>}/>
      <Route path="/gastrobot" element={<GastroBotPage/>}/>
      <Route path="/chat" element={<GastroBotPage/>}/>
      <Route path="/scan" element={<Scan/>}/>
      <Route path="/games" element={<GamesMenu/>}/>
      <Route path="/games/tangkap-kebahagiaan" element={<JoyGame/>}/>
      <Route path="/tracking" element={<Home/>}/>
      <Route path="/checklist" element={<Home/>}/>
      <Route path="/education" element={<Home/>}/>
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>
    <BottomNav key={location.pathname}/>
  </>;
}

function App() {
  return <ThemeProvider><Router><AppLayout/></Router></ThemeProvider>;
}

export default App;
