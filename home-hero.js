import { translator } from './locale.js';

export function renderHomeHero(lang) {
  const t = translator(lang);
  return `<section class="hero" aria-labelledby="hero-title">
    <div class="container hero-main">
      <div class="hero-copy">
        <p class="eyebrow hero-eyebrow">FRC 12414 <span>·</span> Ankara, Türkiye</p>
        <h1 id="hero-title">AIR<br><span class="gold">FORCE</span></h1>
        <p class="hero-identity">Ankara İstech Robotics Force</p>
        <p class="hero-description">${t('İSTEK Ankara Okulları’nın FIRST Robotics Competition takımı.', 'The FIRST Robotics Competition team of İSTEK Ankara Schools.')}</p>
        <div class="hero-actions">
          <a class="button button-gold" href="/takim/">${t('Biz kimiz?', 'Meet the team')} <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg></a>
          <a class="button button-outline" href="#sezon">${t('Sezonu incele', 'Explore the season')}</a>
        </div>
      </div>
      <div class="hero-art">
        <div class="mascot-tilt">
          <img class="mascot" src="/assets/pegasus-800.webp"
            srcset="/assets/pegasus-480.webp 480w, /assets/pegasus-800.webp 800w, /assets/pegasus-1254.webp 1254w"
            sizes="(max-width: 1120px) 44vw, 460px"
            alt="${t('AIR FORCE takımının lacivert, altın ve gümüş renkli Pegasus figürü', 'The AIR FORCE Pegasus in navy, gold and silver')}"
            width="1254" height="1254" fetchpriority="high" draggable="false">
        </div>
      </div>
    </div>
  </section>`;
}
