import React from 'react'
import { Helmet } from 'react-helmet';
import Link from 'gatsby-link'
import styled from 'styled-components'
import formatDate from '../utils/formatDate'
import {cardStyle} from '../styles/basestyle.js'

const FlexContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
`;

const FlexCard = styled.div`
  ${cardStyle}
  flex-basis: 300px;
  a {
    display: block;
  }
`;

const Title = styled.div`
  ${cardStyle}
  max-width: 664px;
`;

const renderReportLink = (report) => {
  const path = `/alpine/${report.node.destination}/${report.node.date}`;
  return (
    <Link key={path} to={path}>
      {formatDate(report.node.date)} - {report.node.title}
    </Link>
  )
};

export default (props) => {
  return (
    <div>
      <Helmet><title>www.dplate.de</title></Helmet>
      <Title>
        <h1>Herzlich willkommen</h1>
        <p>Hier findest Du ein wildes Sammelsurium von allem, was ich für veröffentlichbar halte.</p>
      </Title>

      <FlexContainer>
        <FlexCard>
          <h2>Alpinfunk</h2>
          <p>Diverse Ski- oder Wanderberichte von meinen Ausflügen in die Alpen.</p>
          <p>
            Neueste Berichte:<br />
            {props.data.allReportJson.edges.map(renderReportLink)}
          </p>
        </FlexCard>

        <FlexCard>
          <h2>Fotolabor</h2>
          <p>Eine Auswahl meiner besten Fotos.</p>
          <Link to="/showcase">Anschauen</Link>
        </FlexCard>

        <FlexCard>
          <h2>Spielzimmer</h2>
          <p>Downloads von mir entwickelter PC-Spiele.</p>
          <Link to="/games/schiffbruch">Schiffbruch</Link>
          <Link to="/games/cannonhill">Cannonhill</Link>
          <Link to="/games/modracer">Modracer</Link>
          <Link to="/games/ancient">Antike Spiele</Link>
        </FlexCard>

        <FlexCard>
          <h2>Werkzeugschuppen</h2>
          <p>Downloads von mir entwickelter PC-Tools.</p>
          <Link to="/tools/scapemaker">ScapeMaker</Link>
          <Link to="/tools/kensentme">KenSentMe</Link>
        </FlexCard>
      </FlexContainer>
    </div>
  );
};

export const pageQuery = graphql`
  query LatestReport{
   allReportJson(filter:{}, sort:{fields:[date], order:DESC }, limit:5) {
     edges {
       node {
         destination, 
         date, 
         title
       }
     }
   }
 }
`;
