import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import formatDate from '../../utils/formatDate.js';

const outputMetadata = (date, title, shortTitle, reportPath) => {
  console.log('metadata', {
    title: `⛰ ${title} Wanderung`,
    description:
      'Wanderkarte und Bilder des Wegs ' +
      title +
      ' vom ' +
      formatDate(date) +
      '.\n' +
      'Der ausführliche Bericht dieser Wanderung und der Download der GPX-Datei sind hier zu finden:\n' +
      'https://www.dplate.de/alpine' +
      reportPath +
      '\n' +
      '\n' +
      'Inhalt:\n' +
      'TODO: INSERT SECTIONS HERE\n' +
      '\n' +
      '\n' +
      'Map engine:\n' +
      '- Cesium\n' +
      '\n' +
      'Data Attributions:\n' +
      '- Esri\n' +
      '- Maxar GeoEye\n' +
      '- CNES/Airbus DS\n' +
      '- USDA\n' +
      '- USGS AeroGRID\n' +
      '- IGN\n' +
      '- GIS User Community\n' +
      '- Earthstar Geographics SIO\n' +
      '- geodata © swisstopo\n' +
      '- basemap.at\n' +
      '- freesound.org',
    tags:
      title +
      ',' +
      shortTitle +
      ',Wanderung,Wandern,Alpen,Bilder,Fotos,GPX,Track,Karte,3D,AlpinFunk,Bergsteigen,' +
      'Reise,Urlaub,Beschreibung,Wegbeschreibung,dplate,Rundweg,Weg,Bergweg',
    date: formatDate(date),
    location: shortTitle,
    category: 'Reisen und Events',
    visibility: 'Öffentlich'
  });
};

const addSection = (sections, text) => {
  const lastSection = sections[sections.length - 1];
  const currentTimestamp = Math.round(Date.now() / 1000);
  const sectionTimestamp = (lastSection.photoEndTimestamp + currentTimestamp) / 2;
  const photoEndTimestamp = currentTimestamp + 7;
  if (sectionTimestamp - lastSection.sectionTimestamp < 10) {
    lastSection.photoEndTimestamp = photoEndTimestamp;
    lastSection.text += ` & ${text}`;
  } else {
    sections.push({
      sectionTimestamp,
      photoEndTimestamp,
      text
    });
  }
};

const outputSections = (sections) => {
  console.log(
    sections
      .map((section) => {
        const movieSeconds = section.sectionTimestamp - sections[0].sectionTimestamp;
        return (
          Math.floor(movieSeconds / 60)
            .toString()
            .padStart(2, '0') +
          ':' +
          Math.floor(movieSeconds % 60)
            .toString()
            .padStart(2, '0') +
          ' ' +
          section.text
        );
      })
      .join('\n')
  );
};

const YoutubeMetadata = ({ date, title, shortTitle, reportPath, phaseName, nextPhoto }) => {
  const sectionsRef = useRef([]);

  useEffect(() => {
    outputMetadata(date, title, shortTitle, reportPath);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    switch (phaseName) {
      case 'introScroll':
        sectionsRef.current.push({
          sectionTimestamp: Math.round(Date.now() / 1000) - 3,
          photoEndTimestamp: Math.round(Date.now() / 1000),
          text: 'Titel'
        });
        break;
      case 'photo':
        addSection(sectionsRef.current, nextPhoto.alt);
        break;
      case 'outro':
        outputSections(sectionsRef.current);
        break;
      default:
    }
  }, [phaseName, nextPhoto]);

  return null;
};

YoutubeMetadata.propTypes = {
  date: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  shortTitle: PropTypes.string.isRequired,
  reportPath: PropTypes.string.isRequired,
  phaseName: PropTypes.string.isRequired,
  nextPhoto: PropTypes.shape({
    alt: PropTypes.string
  })
};

export default YoutubeMetadata;
