import React, { useState, useEffect } from 'react';
import { cardStyle, pictureStyle } from '../../styles/basestyle.js';
import styles from './PageSchiffbruch.module.css';

const PageSchiffbruch = (props) => {
  const [playLink, setPlayLink] = useState('https://schiffbruch.dplate.de');
  useEffect(() => {
    if (/android/i.test(window.navigator.userAgent)) {
      setPlayLink('https://play.google.com/store/apps/details?id=de.dplate.schiffbruch');
    }
  }, []);

  return (
    <div>
      <div className={`${cardStyle} ${styles.card}`}>
        <h1>Schiffbruch</h1>
        <p>
          Schiffbruch ist das klassische Survival-Spiel. Man strandet auf einer einsamen Insel und muss nun sein Leben
          meistern. Man kann sich Werkzeuge basteln, angeln, auf Jagd gehen, Felder anlegen und Behausungen bauen. Das
          Ziel ist die Insel zu verlassen. Es ist ein Genremix aus Aufbau, Strategie und Adventure.
        </p>
      </div>
      <a href={playLink} aria-label="Spielen">
        <img className={pictureStyle} src="/screenshots/schiffbruch.jpg" />
      </a>
      <div className={`${cardStyle} ${styles.card}`}>
        <h2>Neuauflage zum 25. Jubiläum</h2>
        <p>
          Damit das Spiel auch weiterhin spielbar ist, habe ich das Originalspiel von 1999 im Jahr 2023 von C++ auf
          Javascript migriert.
          <br />
          Es bietet dieselbe Pixelgrafik und Sounds. Die Benutzeroberfläche wurde leicht angepasst, damit sie auch auf
          Handys und Tablets funktioniert. Außerdem skaliert das Spiel nun auf beliebige Bildschirmgrößen.
          <br />
          Weiter wurden kleine Verbesserungen am Spiel und Bugfixes vorgenommen.
        </p>
        <ul>
          <li>
            <a href="https://schiffbruch.dplate.de">Direkt im Browser spielen</a>
          </li>
          <li>
            <a href="https://play.google.com/store/apps/details?id=de.dplate.schiffbruch">
              Als App in Android installieren
            </a>
          </li>
        </ul>
      </div>
      <div className={`${cardStyle} ${styles.card}`}>
        <h2>Weitere Links</h2>
        <h3>iOS Port von Johannes Tscholl</h3>
        <p>
          <a href="https://itunes.apple.com/de/app/schiffbruch/id1034225507?mt=8">Apple App Store</a>
        </p>
        <h3>Javascript source code</h3>
        <p>
          <a href="https://github.com/dplate/schiffbruch-js">Github</a>
        </p>
      </div>
      <div className={`${cardStyle} ${styles.card}`}>
        <h2>Tipps / Lösung</h2>
        <p>(tippe auf den Text und warte bis er lesbar wird)</p>
        <h3>Wie kann ich Werkzeug herstellen?</h3>
        <p className={styles.spoiler}>
          Suche zuerst mit der Lupe z.B. am Strand nach Steinen und bei einem Baum nach Ästen. Diese beiden
          Gegenstände kannst du im Inventar zu einer Axt kombinieren. Auf die selbe Art und Weise kannst Du noch
          weitere Dinge herstellen.
        </p>
        <h3>Warum sterbe ich ständig?</h3>
        <p className={styles.spoiler}>
          Wenn Du nicht genug isst oder trinkst, dann sinkt deine Gesundheit. Ist diese "verbraucht", dann stirbst Du.
          <br />
          Als erstes solltest Du also Trinkwasser, d.h. einen Fluss finden. Laufe dafür in das Landesinnere und achte
          dabei auf Wassergeräusche. Unterwegs solltest Du dabei Beeren essen, um Dich am Leben zu erhalten. Hast Du
          den Fluss gefunden, trinke, bis dein Wasservorrat wieder voll ist.
          <br />
          Mit einer Angel (finde einen Liana und einen Ast und kombiniere sie im Inventar), kannst Du zudem am Fluss
          leicht auch Nahrung finden.
        </p>
        <h3>Warum kann ich die großen Bäume nicht fällen?</h3>
        <p className={styles.spoiler}>
          Auf den großen Bäumen kannst Du später ein Baumhaus bauen, deshalb können sie nicht gefällt werden.
        </p>
        <h3>Wie kann ich etwas besseres als ein Zelt bauen?</h3>
        <p className={styles.spoiler}>
          Baue Dir zuerst ein Boot am Strand, fahre zu deinem gesunkenem Schiff und gehe dort auf die Suche. Das wird
          Dir weiterhelfen.
        </p>
        <h3>Wie kann ich das Feuer anzünden?</h3>
        <p className={styles.spoiler}>
          Irgendwo am Strand liegt noch ein weiteres Schiffswrack mit nützlichem Inhalt, der dich zu Streichhölzern
          führt.
        </p>
        <h3>Wie kann ich gerettet werden?</h3>
        <p className={styles.spoiler}>
          Deine Rettung hängt vom Zufall ab. Wie groß deine Chance ist, kannst du am Rettungsring ablesen. Die Chance
          erhöhst du permanent durch SOS-Zeichen am Strand oder temporär durch Signalfeuer bzw. Fernglas (möglich auf
          Bergen).
        </p>
      </div>
      <div className={`${cardStyle} ${styles.card}`}>
        <h2>Pressestimmen</h2>
        <h3>PC-Welt</h3>
        <p>"[...] Schiffbruch ist Freeware und bietet einige Stunden recht anspruchsvollen Spielspaß."</p>
        <h3>SharePlay (Juli/August 2000)</h3>
        <p>
          "Können Sie eigentlich nachempfinden, wie sich Robinson gefühlt haben muss, als sein Schiff damals kenterte
          und er völlig allein auf einer unbewohnten Insel strandete? Nein? Jetzt können Sie es. Im Freeware-Spiel
          Schiffbruch geht es ums nackte Überleben. [...]" 4 von 5 Fingern{' '}
        </p>
        <h3>c't (12,2000)</h3>
        <p>
          "Schiffbruch ist eine Überlebenssimulation, sozusagen 'Die Sims' auf einer einsamen Insel. [...] Der Reiz
          liegt in der Erkundung der Insel und dem Herstellen neuer Werkzeuge, Behausungen und Gerätschaften.
          [...]"{' '}
        </p>
      </div>
      <div className={`${cardStyle} ${styles.card}`}>
        <h2>Original von 1999 für Windows</h2>
        <h3>Systemanforderungen</h3>
        <ul>
          <li>Windows95</li>
          <li>32MB RAM</li>
          <li>DirectX6.0</li>
          <li>DirectDraw-kompatible Grafikkarte</li>
          <li>DirectSound-kompatible Soundkarte</li>
          <li>Maus</li>
        </ul>
        <h3>Installationsprogramm für Windows</h3>
        <p>
          Deutsch: <a href="/zips/schiffbruch.exe">schiffbruch.exe: 1 MByte</a>
        </p>
        <p>
          Englisch: <a href="/zips/sbenglish.exe">sbenglish.exe: 1 MByte</a>
        </p>
        <h3>Sourcecode für C++ mit DirectX-SDK</h3>
        <p>
          <a href="/zips/schiffbruchsdk.zip">schiffbruchsdk.zip: 487 kByte</a>
        </p>
      </div>
    </div>
  );
};


export default PageSchiffbruch;
