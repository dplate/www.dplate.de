import React from 'react';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import { cardStyle, pictureStyle, videoContainerStyle, videoWrapperStyle } from '../../styles/basestyle.js';
import Layout from '../../components/layout.jsx';

const Card = styled.div`
  ${cardStyle}
`;

const Picture = styled.img`
  ${pictureStyle}
`;

const VideoContainer = styled.div`
  ${videoContainerStyle}
`;

const VideoWrapper = styled.div`
  ${videoWrapperStyle}
`;

const PageKenSentMe = (props) => {
  return (
    <Layout location={props.location}>
      <div>
        <Helmet>
          <title>KenSentMe</title>
        </Helmet>
        <Card>
          <h1>KenSentMe</h1>
          <p>
            KenSentMe ist ein kleines Tool, um aus einem Bild ein Video zu erstellen. Dafür benutzt es den Ken Burns
            Effekt, d.h. eine virtuelle Kamera schwenkt und zoomt über das Bild.
            <br />
            Zusätzlich werden Spezial-Effekt wie Verwackelung und langsamerer Belichtung verwendet, damit das Video
            realistischer wirkt.
            <br />
            Das Ergebnis kann als einzelne Frames oder als fertiges Video exportiert werden.
          </p>
        </Card>

        <Picture src="/screenshots/kensentme.jpg" alt="KenSentMe Benutzeroberfläche" />

        <VideoContainer>
          <VideoWrapper>
            <iframe
              src="https://www.youtube.com/embed/mwb6_sKLWNE?wmode=transparent"
              frameBorder="0"
              allowFullScreen
              title="Beispiel 1"
            />
          </VideoWrapper>
        </VideoContainer>

        <VideoContainer>
          <VideoWrapper>
            <iframe
              src="https://www.youtube.com/embed/keunot3XZfw?wmode=transparent"
              frameBorder="0"
              allowFullScreen
              title="Beispiel 2"
            />
          </VideoWrapper>
        </VideoContainer>

        <VideoContainer>
          <VideoWrapper>
            <iframe
              src="https://www.youtube.com/embed/16ay-Kw0TcM?wmode=transparent"
              frameBorder="0"
              allowFullScreen
              title="Beispiel 3"
            />
          </VideoWrapper>
        </VideoContainer>

        <Card>
          <h2>Systemanforderungen</h2>
          <ul>
            <li>
              <a href="https://java.com/de/download/">Java</a>
            </li>
            <li>
              Optional um h264 Videos zu erstellen: <a href="https://www.ffmpeg.org/index.html">ffmpeg</a>
            </li>
          </ul>
        </Card>

        <Card>
          <h2>Downloads</h2>
          <h3>Windows 64Bit</h3>
          <p>
            <a href="/zips/kensentme_win64.zip">kensentme_win64.zip: 1,7 MByte</a>
          </p>
          <h3>Windows 32Bit</h3>
          <p>
            <a href="/zips/kensentme_win32.zip">kensentme_win32.zip: 1,5 MByte</a>
          </p>
          <h3>Linux 64Bit</h3>
          <p>
            <a href="/zips/kensentme_linux64.zip">kensentme_linux64.zip: 1,5 MByte</a>
          </p>
          <h3>MacOs 64Bit</h3>
          <p>
            <a href="/zips/kensentme_mac64.zip">kensentme_mac64.zip: 1,5 MByte</a>
          </p>
        </Card>

        <Card>
          <h2>Anleitung</h2>
          <h3>Installation</h3>
          <p>
            Entpacke die zip Datei und starte "kensentme.jar". Dies funktioniert nur, wenn Du Java korrekt installiert
            hast.
          </p>
          <h3>Projekt anlegen</h3>
          <p>
            Nach dem Start kannst du entweder ein bestehendes Projekt laden oder ein Neues erstellen. Um ein Neues zu
            erzeugen, musst Du ein Bild auswählen (mit möglichst hoher Auflösung) und ein Verzeichnis angeben, in dem
            das Projekt und das erzeugte Video landen wird. Dieses Verzeichnis musst Du auch angeben, wenn Du das
            Projekt später wieder laden willst.
          </p>
          <h3>Kamerafahrt definieren</h3>
          <p>
            In der nächsten Ansicht wird Dir das Bild angezeigt. Du kannst mit dem Mausrad zoomen und mit den
            Scrollbalken den Ausschnitt bewegen.
          </p>
          <p>
            Ziehe mit gedrückter linker Maustaste einen Rahmen auf. Dieser legt den ersten Kameraausschnitt fest.
            Wiederhole dies, um beliebig viele weitere Ausschnitte festzulegen. KenSentMe generiert zwischen diesen
            Ausschnitten eine Kamerafahrt (die roten Punkte deuten den Verlauf an).
          </p>
          <p>
            Nach einem Doppelklick auf einen erstellten Rahmen kannst Du noch Feineinstellungen vornehmen, um die
            Geschwindigkeit und das Verhalten der Kamera an diesem Punkt zu verändern.
          </p>
          <h3>Video erzeugen</h3>
          <p>
            Wenn du mit der Kamerafahrt zufrieden bist, kannst du das Video mit Klick auf "Generate mjpeg movie"
            erzeugen. Das erzeugte Video ist nicht gut komprimiert und wird wahrscheinlich einige Gigabyte groß werden.
          </p>
          <p>
            Alternativ kannst du auch die einzelnen Frames generieren, in dem Du auf "Generate frames" klickst. Diese
            kannst Du dann in einem Video-Editor deiner Wahl weiterverwenden.
          </p>
          <p>
            KenSentMe kann auch ein besser komprimiertes Video erzeugen, in dem Du auf "Generate movie with ffmpeg"
            klickst. Dafür musst du aber das "bin" Verzeichnis deines "ffmpeg" Verzeichnisses angegeben, siehe
            "Systemanforderungen".
          </p>
        </Card>

        <Card>
          <h2>Credits</h2>
          Zur Erzeugung des mjpeg Videos verwende ich die Library{' '}
          <a href="https://randelshofer.ch/blog/?p=43">AVIOutputStream</a> von{' '}
          <a href="https://www.randelshofer.ch/">Werner Randelshofer</a>.
        </Card>
      </div>
    </Layout>
  );
};

export default PageKenSentMe;
