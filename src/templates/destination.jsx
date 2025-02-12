import React from 'react';
import { graphql, Link } from 'gatsby';
import styled from 'styled-components';
import formatDate from '../utils/formatDate';
import { cardStyle } from '../styles/basestyle.js';
import Layout from '../components/Layout.jsx';

const Title = styled.h1`
  margin: 16px 0 0 16px;
  display: block;
  color: white;
`;

const FlexContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
`;

const FlexCard = styled.div`
  ${cardStyle};
  flex: 1;
  max-width: 600px;
  background-image: url(${(props) => props.$teaserPath});
  background-repeat: no-repeat;
`;

const ReportTitle = styled.h2`
  color: #000000;
`;

const ReportTeaser = styled.h2`
  display: block;
  position: relative;
  color: #ffffff;
  font-size: 50px !important;
  text-shadow: 2px 2px 4px #000000;
  height: 128px;
  @media (max-width: 1328px) {
    font-size: 40px !important;
    line-height: 1.2 !important;
  }
`;

const ReportLink = styled(Link)`
  display: block;
  margin-bottom: 5px;
`;

const renderReport = (report) => {
  const path = `/alpine/${report.destination}/${report.date.substring(1)}`;
  return (
    <ReportLink key={path} to={path}>
      {formatDate(report.date)} - {report.title}
    </ReportLink>
  );
};

const findTeaserPath = (destination, teaser, type) => {
  if (!teaser) return null;
  return `/destinations/${destination}/${type === 'hike' ? 'wandern' : 'skifahren'}.jpg`;
};

const renderReportTitle = (name, teaser, type) => {
  const title = `${type === 'hike' ? 'Wandern' : 'Skifahren'} ${name}`;
  return teaser ? <ReportTeaser>{title}</ReportTeaser> : <ReportTitle>{title}</ReportTitle>;
};

const renderReports = (name, destination, teaser, reports, type) => {
  if (reports.length === 0) return null;

  const teaserPath = findTeaserPath(destination, teaser, type);

  return (
    <FlexCard $teaserPath={teaserPath}>
      {renderReportTitle(name, teaser, type)}
      {reports.map(renderReport)}
    </FlexCard>
  );
};

const getDestinationTitle = (name, hikeReports, skiReports) => {
  if (hikeReports.length && skiReports.length) return `Ski- und Wandergebiet ${name}`;
  if (hikeReports.length) return `Wandergebiet ${name}`;
  if (skiReports.length) return `Skigebiet ${name}`;
  return name;
};

const getDestinationDescription = (name, hikeReports, skiReports) => {
  if (hikeReports.length && skiReports.length) return `Schnee- und Wanderberichte aus der ${name} Region`;
  if (hikeReports.length) return `Wanderberichte aus der ${name} Region`;
  if (skiReports.length) return `Schneeberichte aus der ${name} Region`;
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
    <Layout location={props.location}>
      <div>
        <Title>{destinationTitle}</Title>
        <FlexContainer>
          {renderReports(name, destination, hikeTeaser, hikeReports, 'hike')}
          {renderReports(name, destination, skiTeaser, skiReports, 'ski')}
        </FlexContainer>
      </div>
    </Layout>
  );
};

export const Head = (props) => {
  const { name } = props.data.destinationJson;
  const { hikeReports, skiReports } = extractReports(props.data.allReportJson);
  const destinationTitle = getDestinationTitle(name, hikeReports, skiReports);
  const destinationDescription = getDestinationDescription(name, hikeReports, skiReports);

  return (
    <>
      <title>{destinationTitle}</title>
      <meta name="description" content={destinationDescription} />
    </>
  );
};

export const pageQuery = graphql`
  query DestinationByDestination($destination: String!) {
    destinationJson(destination: { eq: $destination }) {
      name
      destination
      skiTeaser
      hikeTeaser
    }
    allReportJson(filter: { destination: { eq: $destination } }, sort: { date: DESC }, limit: 1000) {
      edges {
        node {
          destination
          date
          title
          type
        }
      }
    }
  }
`;

export default PageDestination;
