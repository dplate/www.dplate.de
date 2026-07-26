import React from 'react';
import { cardStyle, pictureStyle } from '../../styles/basestyle.js';
import { useState, useEffect } from 'react';

const PageAlpineRoute = (props) => {
  const [playLink, setPlayLink] = useState('https://alpine-route.dplate.de');
  useEffect(() => {
    if (/android/i.test(window.navigator.userAgent)) {
      setPlayLink('https://play.google.com/store/apps/details?id=de.dplate.alpine_route');
    }
  }, []);

  return (
    <>
      <div>
        <div className={cardStyle}>
          <h1>Alpine Route</h1>
          <p>
            In Alpine Route schlüpfst du in die Rolle eines Streckenplaners am Ende des 19. Jahrhunderts. Deine Aufgabe
            ist es, den optimalen Verlauf von Wegen und Eisenbahnen durch anspruchsvolles alpines Gelände zu entwerfen.
            Dabei stehen dir detaillierte Karten realer Landschaften mit präzisen Höhendaten als Hilfsmittel zur
            Verfügung.
          </p>
          <p>
            Im Laufe deiner Karriere wirst du unterschiedlichste Transportwege planen: von Saumpfaden und Straßen über
            Schmalspurbahnen bis hin zu Zahnradbahnen und Standseilbahnen. Jede dieser Verkehrswege stellt dich vor
            spezifische Herausforderungen, da sie strikte Anforderungen an maximale Steigungen und minimale Kurvenradien
            haben. Um diese Vorgaben zu erfüllen, wirst du aufwändige Kehren, Tunnel und spektakuläre Brücken in deinen
            Entwürfen berücksichtigen müssen.
          </p>
          <p>
            Die Szenarien basieren teils auf real existierenden Strecken, wie der berühmten Albulabahn, teils auf
            visionären Projekten, die nie verwirklicht wurden – etwa einer Eisenbahn auf den Säntis.
          </p>
        </div>
        <a href={playLink} aria-label="Spielen">
          <img className={pictureStyle} src="/screenshots/alpine-route.webp" />
        </a>
        <div className={cardStyle}>
          <h2>Systemanforderungen für Android App</h2>
          <ul>
            <li>Android 8.1</li>
            <li>Chrome 121 (WebGPU)</li>
            <li>Nicht optimal auf kleinen Bildschirmen</li>
          </ul>
          <h2>Browseranforderungen für Web-App</h2>
          <p>Das Spiel benötigt einen Browser mit WebGPU Unterstützung.</p>
        </div>
        <div className={cardStyle}>
          <h2>Android App</h2>
          <p>
            <a href="https://play.google.com/store/apps/details?id=de.dplate.alpine_route">Google Play-Store</a>
          </p>
          <h2>Web-App</h2>
          <p>
            <a href="https://alpine-route.dplate.de">alpine-route.dplate.de</a>
          </p>
          <h2>Sourcecode</h2>
          <p>
            <a href="https://github.com/dplate/alpine-route">github.com/dplate/alpine-route</a>
          </p>
        </div>
      </div>
    </>
  );
};


export default PageAlpineRoute;
