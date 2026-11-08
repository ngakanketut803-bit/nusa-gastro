import { HeartPulse } from 'lucide-react';
import GastroBot from '../components/GastroBot';
import SiteHeader from '../components/SiteHeader';

export default function GastroBotPage() {
  return (
    <div className="gg-gastrobot-page">
      <SiteHeader/>
      <main className="gg-focus-page">
        <section className="gg-focus-intro">
          <span className="gg-kicker"><HeartPulse size={15}/> SESI KONSELING</span>
          <h1>Mulai dengan apa yang kamu rasakan.</h1>
          <p>Ceritakan keluhan dan sejak kapan terjadi. Nusa Bot memberi informasi awal; bukan diagnosis medis.</p>
        </section>
        <GastroBot standalone/>
      </main>
    </div>
  );
}
