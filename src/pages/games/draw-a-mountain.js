import React from 'react'
import { Helmet } from 'react-helmet';
import styled from 'styled-components'
import {cardStyle, pictureStyle} from '../../styles/basestyle.js'
import Layout from '../../components/layout'

const Card = styled.div`
  ${cardStyle}
`;

const Picture = styled.img`
  ${pictureStyle}
`;

export default props => {
  return (
    <Layout location={props.location}>
      <div>
        <Helmet><title>Draw-A-Mountain</title></Helmet>
        <Card>
          <h1>Draw-A-Mountain</h1>
          <p>
            Mit Draw-A-Mountain kannst du mit ein paar wenigen Schritten einen Berg erzeugen und ihn dann beobachten.
            Als erstes wird der Grat gezeichnet, dann ein Gipfelkreuz, eine Seilbahn, ein Gasthaus und ein Grillplatz
            erstellt. Anschließend verbindest du alles mit Spazier- und Wanderwegen, sowie Kletterrouten. Zum Schluss
            kommen Wanderer auf deinen Berg und erkunden alles. Dabei kannst du sie auch ganz Nah verfolgen.
          </p>
        </Card>
        <Picture src={__PATH_PREFIX__ + '/screenshots/draw-a-mountain.jpg'} />
        <Card>
          <h2>Systemanforderungen für Android App</h2>
          <ul>
            <li>Android 4.4</li>
            <li>Nicht optimal auf kleinen Bildschirmen</li>
          </ul>
          <h2>Browseranforderungen für Web-App</h2>
          <ul>
            <li>Chrome 84</li>
            <li>Firefox 78</li>
            <li>Edge 84</li>
            <li>Safari 14</li>
          </ul>
        </Card>
        <Card>
          <h2>Android App</h2>
          <p><a href='https://play.google.com/store/apps/details?id=de.dplate.draw_a_mountain'>Google Play-Store</a></p>
          <p><a href='https://www.amazon.de/dP-Software-Draw-A-Mountain/dp/B08FHBY4F4'>Amazon App-Store</a></p>
          <h2>Web-App</h2>
          <p><a href='https://www.draw-a-mountain.com'>Draw-A-Mountain.com</a></p>
          <h2>Sourcecode</h2>
          <p><a href='https://github.com/dplate/draw-a-mountain'>github.com/dplate/draw-a-mountain</a></p>
        </Card>
      </div>
    </Layout>
  );
};
