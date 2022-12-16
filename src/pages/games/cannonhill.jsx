import React from 'react';
import styled from 'styled-components';
import { cardStyle, pictureStyle } from '../../styles/basestyle.js';
import Layout from '../../components/layout.jsx';

const Card = styled.div`
  ${cardStyle}
`;

const Picture = styled.img`
  ${pictureStyle}
`;

const PageCannonhill = (props) => {
  return (
    <Layout location={props.location}>
      <div>
        <Card>
          <h1>Cannonhill</h1>
          <p>
            Cannonhill ist eines der wenigen Spiele, die man an einem PC mit mehreren Leuten spielen kann. Bis zu 4
            Spieler können an einem PC gegeneinander spielen, wahlweise kann aber auch der PC mitspielen. Das Spiel
            erinnert an den Klassiker Tankwars, allerdings findet alles in Echtzeit statt. Vier Bunker beschiessen sich
            auf einem 2D-Gebirge mit den unterschiedlichsten Waffen und versuchen, bis zum Schluss zu überleben.
            Zwischen den Spielrunden kann man sich in einem Laden mit neuen Waffen eindecken.
          </p>
        </Card>
        <Picture src="/screenshots/cannonhill.jpg" />
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
          <p>
            <a href="/zips/cannonhill.exe">cannonhill.exe: 1,2 MByte</a>
          </p>
          <h2>Sourcecode für C++ mit DirectxSDK</h2>
          <p>
            <a href="/zips/cannonhillsdk.zip">cannonhillsdk.zip: 477 kByte</a>
          </p>
        </Card>
      </div>
    </Layout>
  );
};

export const Head = () => {
  return (
    <>
      <title>Cannonhill</title>
    </>
  );
};

export default PageCannonhill;
