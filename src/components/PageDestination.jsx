import React from 'react';
import formatDate from '../utils/formatDate';
import Link from './Link.jsx';
import { cardStyle } from '../styles/basestyle.js';
import styles from './PageDestination.module.css';

const renderReport = (report) => {
  const path = `/alpine/${report.destination}/${report.date}`;
  return (
    <Link key={path} className={styles.reportLink} to={path}>
      {formatDate(report.date)} - {report.title}
    </Link>
  );
};

const findTeaserPath = (destination, teaser, type) => {
  if (!teaser) return null;
  return `/destinations/${destination}/${type === 'hike' ? 'wandern' : 'skifahren'}.jpg`;
};

const renderReportTitle = (name, teaser, type) => {
  const title = `${type === 'hike' ? 'Wandern' : 'Skifahren'} ${name}`;
  return teaser ? <h2 className={styles.reportTeaser}>{title}</h2> : <h2 className={styles.reportTitle}>{title}</h2>;
};

const renderReports = (name, destination, teaser, reports, type) => {
  if (reports.length === 0) return null;

  const teaserPath = findTeaserPath(destination, teaser, type);

  return (
    <div
      className={`${cardStyle} ${styles.flexCard}`}
      style={{ backgroundImage: teaserPath ? `url(${teaserPath})` : undefined }}
    >
      {renderReportTitle(name, teaser, type)}
      {reports.map(renderReport)}
    </div>
  );
};

const getDestinationTitle = (name, hikeReports, skiReports) => {
  if (hikeReports.length && skiReports.length) return `Ski- und Wandergebiet ${name}`;
  if (hikeReports.length) return `Wandergebiet ${name}`;
  if (skiReports.length) return `Skigebiet ${name}`;
  return name;
};

const isHike = (report) => report.type === 'hike' || report.type === 'winterHike';

const extractReports = (allReportsJson) => {
  const reports = allReportsJson.edges.map((element) => element.node);
  const hikeReports = reports.filter(isHike);
  const skiReports = reports.filter((report) => !isHike(report));
  return { hikeReports, skiReports };
};

const PageDestination = (props) => {
  const { name, destination, hikeTeaser, skiTeaser } = props.data.destinationJson;
  const { hikeReports, skiReports } = extractReports(props.data.allReportJson);
  const destinationTitle = getDestinationTitle(name, hikeReports, skiReports);
  return (
    <div>
      <h1 className={styles.title}>{destinationTitle}</h1>
      <div className={styles.flexContainer}>
        {renderReports(name, destination, hikeTeaser, hikeReports, 'hike')}
        {renderReports(name, destination, skiTeaser, skiReports, 'ski')}
      </div>
    </div>
  );
};

export default PageDestination;
