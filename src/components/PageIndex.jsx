import React from 'react';
import formatDate from '../utils/formatDate';
import Link from './Link.jsx';
import { cardStyle } from '../styles/basestyle.js';
import styles from './PageIndex.module.css';

const renderReportLink = (report) => {
  const path = `/alpine/${report.destination}/${report.date}`;
  return (
    <Link key={path} to={path}>
      {formatDate(report.date)} - {report.title}
    </Link>
  );
};

const PageIndex = ({ reports }) => {
  return (
    <div>
      <div className={`${cardStyle} ${styles.title}`}>
        <h1>Herzlich willkommen</h1>
        <p>Hier findest Du ein wildes Sammelsurium von allem, was ich in meiner Freizeit erstelle.</p>
      </div>

      <div className={styles.flexContainer}>
        <div className={`${cardStyle} ${styles.flexCard}`}>
          <h2>Alpinfunk</h2>
          <p>Diverse Wander- oder Skiberichte von meinen Ausflügen in die Berge.</p>
          <p>
            Neueste Berichte:
            <br />
            {reports.map(renderReportLink)}
          </p>
        </div>

        <div className={`${cardStyle} ${styles.flexCard}`}>
          <h2>Spielzimmer</h2>
          <p>Meine PC&#8209; und Handyspiele.</p>
          <Link to="/games/alpine-route">Alpine Route</Link>
          <Link to="/games/schiffbruch">Schiffbruch</Link>
          <Link to="/games/draw-a-mountain">Draw-A-Mountain</Link>
          <Link to="/games/cannonhill">Cannonhill</Link>
          <Link to="/games/modracer">Modracer</Link>
          <Link to="/games/ancient">Antike Spiele</Link>
        </div>

        <div className={`${cardStyle} ${styles.flexCard}`}>
          <h2>Werkzeugschuppen</h2>
          <p>Downloads von mir entwickelter PC&#8209;Tools.</p>
          <Link to="/tools/scapemaker">ScapeMaker</Link>
          <Link to="/tools/kensentme">KenSentMe</Link>
        </div>

        <div className={`${cardStyle} ${styles.flexCard}`}>
          <h2>Fotolabor</h2>
          <p>Eine Auswahl meiner besten Fotos.</p>
          <Link to="/showcase">Anschauen</Link>
        </div>
      </div>
    </div>
  );
};

export default PageIndex;
