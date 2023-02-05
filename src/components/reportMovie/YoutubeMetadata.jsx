import { useEffect } from 'react';
import PropTypes from 'prop-types';
import formatDate from '../../utils/formatDate.js';

const extractSecondsFromDate = (dateString) => {
  const date = new Date(Date.parse(dateString));
  return date.getTime() / 1000;
};

const generateSections = (track, landmarks) => {
  let lastSeconds = track.startTimestamp / 1000;
  let lastMovieSeconds = 5;
  const sections = [
    {
      movieSeconds: 0,
      text: 'Titel'
    }
  ];
  landmarks.forEach((landmark) => {
    landmark.photos.forEach((photo) => {
      if (photo.date) {
        const seconds = extractSecondsFromDate(photo.date);
        const secondsDiff = Math.max(1, seconds - lastSeconds);
        const movieSeconds = lastMovieSeconds + 5 + Math.log10(secondsDiff / 30) * 6.1;
        sections.push({
          movieSeconds: (movieSeconds + lastMovieSeconds + 5) / 2,
          text: photo.alt
        });
        lastSeconds = seconds;
        lastMovieSeconds = movieSeconds;
      }
    });
  });

  let shortestDiff = Number.MAX_VALUE;
  do {
    let shortestIndex = null;
    shortestDiff = Number.MAX_VALUE;
    for (let i = 0; i < sections.length - 1; i++) {
      const diff = sections[i + 1].movieSeconds - sections[i].movieSeconds;
      if (diff <= shortestDiff) {
        shortestDiff = diff;
        shortestIndex = i;
      }
    }
    if (shortestIndex !== null && shortestDiff < 10) {
      sections[shortestIndex].text += ' & ' + sections[shortestIndex + 1].text;
      sections.splice(shortestIndex + 1, 1);
    }
  } while (shortestDiff < 10);

  return sections.map(
    (section) =>
      Math.floor(section.movieSeconds / 60)
        .toString()
        .padStart(2, '0') +
      ':' +
      Math.floor(section.movieSeconds % 60)
        .toString()
        .padStart(2, '0') +
      ' ' +
      section.text
  );
};

const outputMetadata = (date, title, shortTitle, landmarks, reportPath, track) => {
  const sections = generateSections(track, landmarks);
  console.log({
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
      sections.join('\n') +
      '\n' +
      '\n' +
      'Map engine:\n' +
      '- Cesium\n' +
      '\n' +
      'Data Attributions:\n' +
      '- Bing Imagery\n' +
      '- © 2023 Microsoft Corporation\n' +
      '- Data available from the U.S. Geological Survey, © CGIAR-CSI, Produced using Copernicus data and information funded by the European Union - EU-DEM layers, Data available from Land Information New Zealand, Data available from data.gov.uk, Data courtesy Geoscience Australia\n' +
      '- Earthstar Geographics  SIO\n' +
      '- © 2023 Maxar\n' +
      '- ©CNES (2023) Distribution Airbus DS\n' +
      '- geodata © swisstopo\n' +
      '- basemap.at',
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

const YoutubeMetadata = ({ date, title, shortTitle, landmarks, reportPath, track }) => {
  useEffect(() => {
    outputMetadata(date, title, shortTitle, landmarks, reportPath, track);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};

YoutubeMetadata.propTypes = {
  date: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  shortTitle: PropTypes.string.isRequired,
  landmarks: PropTypes.array.isRequired,
  reportPath: PropTypes.string.isRequired,
  track: PropTypes.shape({
    startTimestamp: PropTypes.number.isRequired
  }).isRequired
};

export default YoutubeMetadata;
