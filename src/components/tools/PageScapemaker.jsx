import React from 'react';
import { cardStyle, pictureStyle } from '../../styles/basestyle.js';

const PageScapeMaker = (props) => {
  return (
    <>
      <div>
        <div className={cardStyle}>
          <h1>ScapeMaker</h1>
          <p>
            ScapeMaker ist ein einfach bedienbarer, aber leistungsfähiger, Landschaftsgenerator. Über eine
            benutzerfreundliche Oberfläche lassen sich mittels weniger Parameter realistische Höhenprofile und
            abwechslungsreiche Bodentexturen erzeugen. Auf diese Landschaft können mitgelieferte Objekte (z.B. Bäume und
            Gras) verteilt werden. Außerdem sind Spezialeffekte wie realistischer höhenbasierter Nebel, Tageszeiten,
            Wolken und Meer konfigurierbar. Diese generierte Landschaft kann anschließend in einer leistungsfähigen
            3D-Engine in Echtzeit besichtigt und Screenshots angefertigt werden.
          </p>
        </div>
        <img className={pictureStyle} src="/screenshots/scapemaker1.jpg" />
        <img className={pictureStyle} src="/screenshots/scapemaker2.jpg" />
        <img className={pictureStyle} src="/screenshots/scapemaker3.jpg" />
        <div className={cardStyle}>
          <h2>Systemanforderungen</h2>
          <ul>
            <li>WindowsXP</li>
            <li>DirectX 9.0c</li>
          </ul>
        </div>
        <div className={cardStyle}>
          <h2>Installationsprogramm für Windows</h2>
          <p>
            <a href="/zips/ScapeMakerSetup_1_3.exe">ScapeMakerSetup_1_3.exe: 4,4 MByte</a>
          </p>
          <h2>Original Sourcecode für C++ mit DirectX-SDK</h2>
          <p>
            <a href="/zips/scapemakersdk.zip">scapemakersdk.zip: 17 MByte</a>
          </p>
        </div>
      </div>
    </>
  );
};


export default PageScapeMaker;
