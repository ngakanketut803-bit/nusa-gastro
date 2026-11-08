import { ExternalLink, Gamepad2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import { publicAsset } from '../lib/publicAsset';
import './GamesMenu.css';

const GAMES = [
  {
    title: 'Pasangkan Jawaban',
    description: 'Latih literasi dan numerasi lewat permainan mencocokkan jawaban.',
    image: 'games-pasang-jawaban.png',
    imageAlt: 'Ilustrasi dua kartu permainan untuk memasangkan jawaban',
    href: 'https://www.educaplay.com/learning-resources/24958140-literasi_numerasi.html',
    tone: 'match',
  },
  {
    title: 'Puzzle Gastrointestinal',
    description: 'Susun kepingan puzzle sambil mengenal sistem gastrointestinal.',
    image: 'puzzle.png',
    imageAlt: 'Ilustrasi dua kepingan puzzle berwarna',
    href: 'https://www.educaplay.com/learning-resources/31393294-puzzle_gastrointestinal.html',
    tone: 'puzzle',
  },
];

export default function GamesMenu() {
  return (
    <>
      <SiteHeader />
      <main className="gg-games-main">
        <section className="gg-games-intro" aria-labelledby="games-title">
          <span className="gg-kicker"><Gamepad2 size={15} /> BELAJAR SAMBIL BERMAIN</span>
          <h1 id="games-title">Pilih permainanmu</h1>
          <p>Asah pengetahuan dan temani perjalanan dengan permainan edukatif ringan.</p>
        </section>

        <section className="gg-games-grid" aria-label="Daftar permainan edukatif">
          {GAMES.map((game) => (
            <article className={`gg-game-card ${game.tone}`} key={game.title}>
              <div className="gg-game-art">
                <img src={publicAsset(`nusa-gastro-assets/features/${game.image}`)} alt={game.imageAlt} />
              </div>
              <div className="gg-game-content">
                <span className="gg-game-label">PERMAINAN EDUKATIF</span>
                <h2>{game.title}</h2>
                <p>{game.description}</p>
                <a className="gg-game-link" href={game.href} target="_blank" rel="noopener noreferrer">
                  Buka permainan <ExternalLink size={16} aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
        </section>

        <Link className="gg-legacy-game-link" to="/games/tangkap-kebahagiaan">
          <span className="gg-legacy-game-icon"><Sparkles size={18} aria-hidden="true" /></span>
          <span><b>Tangkap Kebahagiaan</b><small>Masih ingin mencoba mini-game Nusa Gastro?</small></span>
          <span className="gg-legacy-game-arrow" aria-hidden="true">→</span>
        </Link>
      </main>
    </>
  );
}
