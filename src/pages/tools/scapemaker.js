import React from 'react';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import { cardStyle, pictureStyle } from '../../styles/basestyle.js';
import Layout from '../../components/layout';

const Card = styled.div`
  ${cardStyle}
`;

const Picture = styled.img`
  ${pictureStyle}
`;

const PageScapeMaker = (props) => {
  return (
    <Layout location={props.location}>
      <div>
        <Helmet>
          <title>ScapeMaker</title>
        </Helmet>
        <Card>
          <h1>ScapeMaker</h1>
          <p>
            ScapeMaker ist ein einfach bedienbarer, aber leistungsfähiger, Landschaftsgenerator. Über eine
            benutzerfreundliche Oberfläche lassen sich mittels weniger Parameter realistische Höhenprofile und
            abwechslungsreiche Bodentexturen erzeugen. Auf diese Landschaft können mitgelieferte Objekte (z.B. Bäume und
            Gras) verteilt werden. Außerdem sind Spezialeffekte wie realistischer höhenbasierter Nebel, Tageszeiten,
            Wolken und Meer konfigurierbar. Diese generierte Landschaft kann anschließend in einer leistungsfähigen
            3D-Engine in Echtzeit besichtigt und Screenshots angefertigt werden.
          </p>
        </Card>
        <Picture src='/screenshots/scapemaker1.jpg' />
        <Picture src='/screenshots/scapemaker2.jpg' />
        <Picture src='/screenshots/scapemaker3.jpg' />
        <Card>
          <h2>Systemanforderungen</h2>
          <ul>
            <li>WindowsXP</li>
            <li>Directx 9.0c</li>
          </ul>
        </Card>
        <Card>
          <h2>Installationsprogramm für Windows</h2>
          <p>
            <a href='/zips/ScapeMakerSetup_1_3.exe'>ScapeMakerSetup_1_3.exe: 4,4 MByte</a>
          </p>
          <h2>Original Sourcecode für C++ mit DirectxSDK</h2>
          <p>
            <a href='/zips/scapemakersdk.zip'>scapemakersdk.zip: 17 MByte</a>
          </p>
        </Card>
      </div>
    </Layout>
  );
};

export default PageScapeMaker;
