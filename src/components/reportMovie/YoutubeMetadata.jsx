import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import formatDate from '../../utils/formatDate.js';

const outputMetadata = (date, destinationName, title, shortTitle, reportPath) => {
  console.log('metadata', {
    title: `⛰ ${title} Wanderung`,
    description: `${destinationName} Wanderung: Beschreibung, Bilder und Karte des Wegs ${title} vom ${formatDate(date)}.
Der Bericht dieser Wanderung und der Download der GPX-Datei sind hier zu finden:
https://www.dplate.de/alpine${reportPath}

Inhalt:
TODO: INSERT SECTIONS HERE


Map engine:
- Cesium

Data Attributions:
- © Microsoft Corporation
- © Maxar
- © CNES Distribution Airbus DS
- Bing Imagery
- Esri
- USDA
- USGS AeroGRID
- IGN
- GIS User Community
- Earthstar Geographics SIO
- geodata © swisstopo
- basemap.at
- freesound.org`,
    tags: `${destinationName},${shortTitle},Wanderung,Wandern,Alpen,Bilder,Fotos,GPX,Track,Karte,3D,AlpinFunk,Bergsteigen,Reise,Urlaub,Beschreibung,Wegbeschreibung,dplate,Rundweg,Weg,Bergweg`,
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

const YoutubeMetadata = ({ date, destinationName, title, shortTitle, reportPath, phaseName, nextPhoto }) => {
  const sectionsRef = useRef([]);

  useEffect(() => {
    outputMetadata(date, destinationName, title, shortTitle, reportPath);
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
  destinationName: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  shortTitle: PropTypes.string.isRequired,
  reportPath: PropTypes.string.isRequired,
  phaseName: PropTypes.string.isRequired,
  nextPhoto: PropTypes.shape({
    alt: PropTypes.string
  })
};

export default YoutubeMetadata;
