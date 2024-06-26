import React from 'react';
import styled from 'styled-components';
import { cardStyle, pictureStyle } from '../../styles/basestyle.js';
import Layout from '../../components/Layout.jsx';

const Card = styled.div`
  ${cardStyle}
`;

const Picture = styled.img`
  ${pictureStyle}
`;

const PageModracer = (props) => {
  return (
    <Layout location={props.location}>
      <div>
        <Card>
          <h1>Modracer</h1>
          <p>
            Modracer ist ein 3D Rennspiel für bis zu vier Spieler an einem PC. Gefahren wird auf verschiedenen Strecken
            der Welt bei unterschiedlichem Wetter und Tageslicht. Besonders Wert wurde darauf gelegt, dass es über
            einfache Textdateien leicht erweiterbar ist. Es können eigene Strecken, Autos und Streckenobjekte
            hinzugefügt werden.
          </p>
        </Card>
        <Picture src="/screenshots/modracer.jpg" />
        <Card>
          <h2>Systemanforderungen</h2>
          <ul>
            <li>WindowsXP</li>
            <li>128MB RAM</li>
            <li>DirectX8.0</li>
          </ul>
        </Card>
        <Card>
          <h2>Zip-Datei mit dem Spiel</h2>
          <p>
            <a href="/zips/modracer.zip">modracer.zip: 2,9 MByte</a>
          </p>
          <h2>Sourcecode für C++ mit DirectX-SDK</h2>
          <p>
            <a href="/zips/modracersdk.zip">modracersdk.zip: 2,7 MByte</a>
          </p>
        </Card>
        <Card>
          <h2>Erweiterungen von anderen Spielern</h2>
          <h3>Autos</h3>
          <p>
            <a href="/zips/bugatti.zip">Bugatti</a>
          </p>
          <p>
            <a href="/zips/rtufo.zip">Ufo</a>
          </p>
          <h3>Strecken</h3>
          <p>
            <a href="/zips/crossover.zip">Crossover</a>
          </p>
          <p>
            <a href="/zips/justmap.zip">Justmap</a>
          </p>
          <p>
            <a href="/zips/konstanz.zip">Konstanz</a>
          </p>
          <p>
            <a href="/zips/kuhmap.zip">Kuhmap</a>
          </p>
          <p>
            <a href="/zips/schnecke.zip">Schnecke</a>
          </p>
          <p>
            <a href="/zips/wueste.zip">Wüste</a>
          </p>
          <h3>Straßenset</h3>
          <p>
            <a href="/zips/desert.zip">Desert</a>
          </p>
        </Card>
      </div>
    </Layout>
  );
};

export const Head = () => {
  return (
    <>
      <title>Modracer</title>
    </>
  );
};

export default PageModracer;
