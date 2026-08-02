import React from 'react';
import { cardStyle, pictureStyle } from '../../styles/basestyle.js';

const PageCannonhill = (props) => {
  return (
    <div>
      <div className={cardStyle}>
        <h1>Cannonhill</h1>
        <p>
          Cannonhill ist eines der wenigen Spiele, die man an einem PC mit mehreren Leuten spielen kann. Bis zu 4
          Spieler können an einem PC gegeneinander spielen, wahlweise kann aber auch der PC mitspielen. Das Spiel
          erinnert an den Klassiker Tankwars, allerdings findet alles in Echtzeit statt. Vier Bunker beschiessen sich
          auf einem 2D-Gebirge mit den unterschiedlichsten Waffen und versuchen, bis zum Schluss zu überleben.
          Zwischen den Spielrunden kann man sich in einem Laden mit neuen Waffen eindecken.
        </p>
      </div>
      <img className={pictureStyle} src="/screenshots/cannonhill.jpg" />
      <div className={cardStyle}>
        <h2>SDL Port von Alexander (läuft auch auf aktuellen Rechnern)</h2>
        <p>
          <a href="https://univrsal.github.io/cannonhill-sdl/">Im Browser starten</a>
        </p>
        <p>
          <a href="https://github.com/univrsal/cannonhill-sdl/releases">Download für Windows und Linux</a>
        </p>
        <h2>Original Installationsprogramm für Windows (läuft nur noch mit Glück)</h2>
        <p>
          <a href="/zips/cannonhill.exe">cannonhill.exe: 1,2 MByte</a>
        </p>
        <h2>Original Sourcecode für C++ mit DirectX-SDK</h2>
        <p>
          <a href="/zips/cannonhillsdk.zip">cannonhillsdk.zip: 477 kByte</a>
        </p>
      </div>
      <div className={cardStyle}>
        <h2>Original Systemanforderungen</h2>
        <ul>
          <li>Windows95</li>
          <li>32MB RAM</li>
          <li>DirectX6.0</li>
          <li>DirectDraw-kompatible Grafikkarte</li>
          <li>DirectSound-kompatible Soundkarte</li>
          <li>Maus</li>
        </ul>
      </div>
    </div>
  );
};


export default PageCannonhill;
