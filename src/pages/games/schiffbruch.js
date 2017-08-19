import React from 'react'
import { Helmet } from 'react-helmet';
import styled from 'styled-components'
import {cardStyle, pictureStyle} from '../../styles/basestyle.js'

const Card = styled.div`
  ${cardStyle}
`;

const Spoiler = styled.p`
  filter: blur(5px);
  transition: filter 5s;
  &:hover, &:active {
    filter: blur(0px);
  }
`;

const Picture = styled.img`
  ${pictureStyle}
`;

export default () => {
  return (
    <div>
      <Helmet><title>Schiffbruch</title></Helmet>
      <Card>
        <h1>Schiffbruch</h1>
        <p>
          Schiffbruch ist das klassische Survival-Spiel. Man
          strandet auf einer einsamen Insel und muss nun sein Leben
          meistern. Man kann sich Werkzeuge basteln, angeln, auf
          Jagd gehen, Felder anlegen und Behausungen bauen. Das
          Ziel ist die Insel zu verlassen.
          Es ist ein Genremix aus Aufbau, Strategie und Adventure.
        </p>
      </Card>
      <Picture src={__PATH_PREFIX__ + '/screenshots/schiffbruch.jpg'} />
      <Card>
        <h2>Systemanforderungen</h2>
        <ul>
          <li>Windows95</li>
          <li>32MB RAM</li>
          <li>Directx6.0</li>
          <li>DirectDraw-kompatible Grafikkarte</li>
          <li>Directsound-kompatible Soundkarte</li>
          <li>Maus</li>
        </ul>
      </Card>
      <Card>
        <h2>Installationsprogramm für Windows</h2>
        <p>Deutsch: <a target="_blank" href={__PATH_PREFIX__ + '/zips/schiffbruch.exe'}>schiffbruch.exe: 1 MByte</a></p>
        <p>Englisch: <a target="_blank" href={__PATH_PREFIX__ + '/zips/sbenglish.exe'}>sbenglish.exe: 1 MByte</a></p>
        <h2>Original Sourcecode für C++ mit DirectxSDK</h2>
        <p><a target="_blank" href={__PATH_PREFIX__ + 'zips/schiffbruchsdk.zip'}>schiffbruchsdk.zip: 487 kByte</a></p>
      </Card>
      <Card>
        <h2>Weitere Links</h2>
        <h3>Mobile Ports von Johannes Tscholl</h3>
        <p>
          <ul>
            <li><a href="https://play.google.com/store/apps/details?id=com.johannestscholl.schiffbruch&hl=de">Android</a></li>
            <li><a href="https://itunes.apple.com/de/app/schiffbruch/id1034225507?mt=8">IOS</a></li>
          </ul>
        </p>
        <h3>Modernisierter Sourcecode von Lukas Dürrenberger</h3>
        <p><a href="https://github.com/eXpl0it3r/Schiffbruch">Github</a></p>
      </Card>
      <Card>
        <h2>Tipps / Lösung</h2>
        <p>(tippe auf den Text und warte bis er lesbar wird)</p>
        <h3>Wie kann ich Werkzeug herstellen?</h3>
        <Spoiler>
          Suche zuerst mit der Lupe z.B. am Strand nach Steinen und bei einem Baum nach Ästen. Diese beiden Gegenstände
          kannst du im Inventar zu einer Axt kombinieren. Auf die selbe Art und Weise kannst Du noch weitere Dinge
          herstellen.
        </Spoiler>
        <h3>Warum sterbe ich ständig?</h3>
        <Spoiler>
          Wenn Du nicht genug isst oder drinkst, dann sinkt deine Gesundheit. Ist diese "verbraucht", dann stirbst Du.<br />
          Als erstes solltest Du also Trinkwasser, d.h. einen Fluss finden. Laufe dafür in das Landesinnere und achte dabei
          auf Wassergeräusche. Unterwegs solltest Du dabei Beeren essen, um Dich am Leben zu erhalten. Hast Du den Fluss
          gefunden, trinke, bis dein Wasservorrat wieder voll ist.<br />
          Mit einer Angel (finde einen Liana und einen Ast und kombiniere sie im Inventar), kannst Du zudem am Fluss
          leicht auch Nahrung finden.
        </Spoiler>
        <h3>Warum kann ich die großen Bäume nicht fällen?</h3>
        <Spoiler>
          Auf den großen Bäumen kannst Du später ein Baumhaus bauen, deshalb können sie nicht gefällt werden.
        </Spoiler>
        <h3>Wie kann ich etwas besseres als ein Zelt bauen?</h3>
        <Spoiler>
          Baue Dir zuerst ein Boot am Strand, fahre zu deinem gesunkenem Schiff und gehe dort auf die Suche. Das wird
          Dir weiterhelfen.
        </Spoiler>
        <h3>Wie kann ich das Feuer anzünden?</h3>
        <Spoiler>
          Irgendwo am Strand liegt noch ein weiteres Schiffswrack mit nützlichem Inhalt, der dich zu Streichhölzern führt.
        </Spoiler>
        <h3>Wie kann ich gerettet werden?</h3>
        <Spoiler>
          Deine Rettung hängt vom Zufall ab. Wie groß deine Chance ist, kannst du am Rettungsring ablesen. Die Chance
          erhöhst du permantent durch SOS-Zeichen am Strand oder temporär durch Signalfeuer bzw. Fernglas (möglich auf Bergen).
        </Spoiler>
      </Card>
      <Card>
        <h2>Pressestimmen</h2>
        <h3>PC-Welt</h3>
        <p>"[...] Schiffbruch ist Freeware und bietet einige Stunden recht anspruchsvollen Spielspaß."</p>
        <h3>SharePlay (Juli/August 2000)</h3>
        <p>"Können Sie eigentlich nachempfinden, wie sich Robinson gefühlt haben muss, als sein Schiff damals kenterte und er völlig allein auf einer unbewohnten Insel strandete? Nein? Jetzt können Sie es. Im Freeware-Spiel Schiffbruch geht es ums nackte Überleben. [...]" 4 von 5 Fingern </p>
        <h3>c't (12,2000)</h3>
        <p>"Schiffbruch ist eine Überlebenssimulation, sozusagen 'Die Sims' auf einer einsamen Insel. [...] Der Reiz liegt in der Erkundung der Insel und dem Herstellen neuer Werkzeuge, Behausungen und Gerätschaften. [...]" </p>
      </Card>
    </div>
  );
};
