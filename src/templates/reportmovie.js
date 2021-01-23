import React, {Fragment} from 'react';
import {Helmet} from 'react-helmet';
import Map from '../components/map';
import Title from '../components/title';
import {graphql} from 'gatsby';
import {EXIF} from '../external/exif-js/exif.js';
import styled from 'styled-components';
import formatDate from '../utils/formatDate.js';

const Movie = styled.div`
  position: fixed;
  width: 100vw;
  height: 100vh;
  color: white;
`;

const Curtain = styled.div.attrs(({opacity}) => ({
  style: ({ opacity })
}))`
  position: fixed;
  width: 100%;
  height: 100%;
  background-color: black;
  z-index: 5;
  transition: opacity 5s ease-in-out;
`;

const Logo = styled.img.attrs(({width, top, left}) => ({
  style: ({
    width: `${width}px`,
    top: `${top}vh`,
    left: `${left}vw`,
  })
}))`
  position: fixed;
  transform: translate(-50%, -50%);
  z-index: 6;
  filter: invert(100%) sepia(0%) saturate(7444%) hue-rotate(88deg) brightness(123%) contrast(111%) drop-shadow(0 0 4px black);
  transition: width 5s ease-in-out, top 5s ease-in-out, left 5s ease-in-out;
`;

const Landmark = styled.div`
`;

const Photo = styled.img.attrs(({opacity}) => ({
  style: ({ opacity })
}))`
  position: fixed;
  display: block;
  box-shadow: 0 0 400px 200px black;
  z-index: 5;
  max-width: 100%;
  max-height: 100%;
  top: 50%;
  left: 50%;
  margin-right: -50%;
  transform: translate(-50%, -50%);
  transition: opacity 1s ease-in-out;
`;

const Label = styled.div.attrs(({offsetY}) => ({
  style: ({
    top: `calc(100% - ${offsetY}px)`
  })
}))`
  position: fixed;
  display: block;
  z-index: 6;
  max-width: 100%;
  left: 50%;
  margin-right: -50%;
  transform: translate(-50%, 0);
  font-size: 30px;
  text-shadow: 0 0 4px black;
  transition: top 2s ease-in-out;
`;

class ReportMovie extends React.Component {
  constructor(props) {
    super(props);
    this.nextPhase = this.nextPhase.bind(this);
    this.renderLandmark = this.renderLandmark.bind(this);
    this.state = {
      phase: 'intro',
      photo: undefined
    };
  }

  getReportPath() {
    return '/' + this.props.data.reportJson.destination + '/' + this.props.data.reportJson.date.substring(1);
  }

  async outputMetadata() {
    const {date, destination, title, shortTitle} = this.props.data.reportJson;
    const sections = await this.generateSections();
    console.log({
      title: `⛰ ${title} Wanderung`,
      description: 'Wanderkarte und Bilder des Wegs ' + title + ' vom ' + formatDate(date) + '.\n' +
        'Der ausführliche Bericht dieser Wanderung und der Download der GPX-Datei sind hier zu finden:\n' +
        'https://www.dplate.de/alpine' + this.getReportPath() + '\n' +
        '\n' +
        'Inhalt:\n' +
        sections.join('\n') + '\n' +
        '\n' +
        'Map engine:\n' +
        '- Cesium\n' +
        '\n' +
        'Data Attributions:\n' +
        '- Bing Imagery\n' +
        '- © 2020 Microsoft Corporation\n' +
        '- Data available from the U.S. Geological Survey, © CGIAR-CSI, Produced using Copernicus data and information funded by the European Union - EU-DEM layers, Data available from Land Information New Zealand, Data available from data.gov.uk, Data courtesy Geoscience Australia\n' +
        '- Earthstar Geographics  SIO\n' +
        '- © 2020 Maxar\n' +
        '- ©CNES (2020) Distribution Airbus DS\n' +
        '- geodata © swisstopo\n' +
        '- basemap.at',
      playlist: destination.charAt(0).toUpperCase() + destination.slice(1) + ' Wanderungen',
      tags: title + ',' + shortTitle + ',Wanderung,Wandern,Alpen,Bilder,Fotos,GPX,Track,Karte,3D,AlpinFunk,Bergsteigen,' +
        'Reise,Urlaub,Beschreibung,Wegbeschreibung,dplate,Rundweg,Weg,Bergweg',
      date: formatDate(date),
      location: shortTitle,
      category: 'Reisen und Events',
      visibility: 'Öffentlich'
    });
  }

  async generateSections() {
    const gpxRaw = await (await fetch(this.buildGpxPath())).text();
    const doc = (new window.DOMParser()).parseFromString(gpxRaw, 'text/xml');
    const trackPoints = Array.prototype.slice.call(doc.getElementsByTagName('trkpt'));
    const startDate = trackPoints[0].getElementsByTagName('time')[0].firstChild.nodeValue;
    let lastSeconds =
      Number(startDate.substring(11, 13)) * 60 * 60 +
      Number(startDate.substring(14, 16)) * 60 +
      Number(startDate.substring(17, 19));
    let lastMovieSeconds = 7;
    const sections = [{
      movieSeconds: 0,
      text: 'Titel'
    }];
    this.props.data.reportJson.landmarks.forEach(landmark => {
      landmark.photos.forEach(photo => {
        const secondsDiff = photo.seconds - lastSeconds;
        const movieSeconds = lastMovieSeconds + 5 + Math.log10(secondsDiff / 20) * 4.925;
        sections.push({
          movieSeconds: (movieSeconds + lastMovieSeconds + 5) / 2,
          text: photo.alt
        });
        lastSeconds = photo.seconds;
        lastMovieSeconds = movieSeconds;
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

    return sections.map(section =>
      Math.floor(section.movieSeconds / 60).toString().padStart(2, '0') + ':' +
      Math.floor(section.movieSeconds % 60).toString().padStart(2, '0') + ' ' +
      section.text
    );
  }

  componentDidMount() {
    this.retrievePhotoDates();
  }

  findNextPhoto() {
    const landmarks = this.props.data.reportJson.landmarks;
    for (let landmarkIndex = 0; landmarkIndex < landmarks.length; landmarkIndex++) {
      const photos = landmarks[landmarkIndex].photos;
      for (let photoIndex = 0; photoIndex < photos.length; photoIndex++) {
        if (photos[photoIndex] === this.state.photo) {
          if (photos[photoIndex + 1]) {
            return photos[photoIndex + 1];
          } else if (landmarks[landmarkIndex + 1]) {
            return landmarks[landmarkIndex + 1].photos[0];
          }
        }
      }
    }
    return undefined;
  }

  nextPhase() {
    switch (this.state.phase) {
      case 'intro':
        this.setState({
          phase: 'introScroll'
        });
        window.setTimeout(this.nextPhase, 5000);
        break;
      case 'introScroll':
        this.setState({
          phase: 'map',
          photo: this.props.data.reportJson.landmarks[0].photos[0]
        });
        break;
      case 'map':
        if (this.state.photo) {
          this.setState({
            phase: 'photo'
          });
          window.setTimeout(this.nextPhase, 5000);
        } else {
          this.setState({
            phase: 'outro',
            photo: undefined
          });
        }
        break;
      case 'photo':
        this.setState({
          phase: 'map',
          photo: this.findNextPhoto()
        });
        break;
      default:
        break;
    }
  }

  getTargetTime() {
    switch (this.state.phase) {
      case 'intro':
      case 'introScroll':
        return 'start';
      case 'map':
      case 'photo':
        if (this.state.photo) {
          return this.state.photo.date;
        } else {
          return 'end';
        }
      default:
        return 'end';
    }
  }

  retrievePhotoDate(imgElement) {
    const self = this;
    EXIF.getData(imgElement, function() {
      const exifDate = EXIF.getTag(this, 'DateTimeOriginal');
      const gpsTime = EXIF.getTag(this, 'GPSTimeStamp');
      let photoDate = null;
      let photoSeconds = null;
      if (!exifDate || !gpsTime) {
        self.props.data.reportJson.landmarks = self.props.data.reportJson.landmarks.filter(landmark => {
          landmark.photos = landmark.photos.filter(photo => photo.name !== imgElement.id);
          return landmark.photos.length > 0;
        });
      } else {
        const [date, time] = exifDate.split(' ');
        photoDate = date.replace(/:/g, '-') + 'T' + time;
        photoSeconds = gpsTime[0] * 60 * 60 + gpsTime[1] * 60 + gpsTime[2];
      }
      let allDatesRetrieved = true;
      self.props.data.reportJson.landmarks.forEach(landmark => {
        landmark.photos.forEach(photo => {
          if (photoDate && photoSeconds && photo.name === imgElement.id) {
            photo.date = photoDate;
            photo.seconds = photoSeconds;
          }
          if (!photo.date) {
            allDatesRetrieved = false;
          }
        });
      });
      if (allDatesRetrieved) {
        self.outputMetadata();
        window.setTimeout(self.nextPhase, 8000);
      }
    });
  }

  retrievePhotoDates() {
    document.querySelectorAll('.landmark img').forEach(imgElement => {
      if (imgElement.complete) {
        this.retrievePhotoDate(imgElement);
      } else {
        imgElement.onload = this.retrievePhotoDate.bind(this, imgElement);
      }
    })
  }

  renderPhoto(photo, index) {
    const fileName = photo.name;
    const photoPath = __PATH_PREFIX__ + '/photos' + this.getReportPath() + '/' + fileName + '.jpg';
    const isShown = this.state.phase === 'photo' && this.state.photo.name === fileName;
    const opacity = isShown ? 1 : 0;
    const offsetY = isShown ? 75 : -100;
    return <Fragment key={index}>
      <Photo
        id={fileName}
        src={photoPath}
        alt={photo.alt}
        opacity={opacity}
      />
      <Label offsetY={offsetY}>{photo.alt}</Label>
    </Fragment>
  }

  renderLandmark(landmark, index) {
    return (
      <Landmark key={index} className="landmark">
        {landmark.photos && landmark.photos.map(this.renderPhoto.bind(this))}
      </Landmark>
    )
  }

  renderTitle() {
    const introActive = this.state.phase === 'intro'
    const {date, title, title3d} = this.props.data.reportJson;
    const fullTitle = title + ' - ' + formatDate(date);
    return <Title
      reportPath={this.getReportPath()}
      title={fullTitle}
      title3d={title3d}
      visible={introActive}
    />;
  }

  renderLogo() {
    const introActive = this.state.phase === 'intro'
    const outroActive = this.state.phase === 'outro'
    const top = introActive ? 75 : (outroActive ? 50 : 95);
    const left = (introActive || outroActive) ? 50 : 95;
    const width = introActive ? 400 : (outroActive ? 800 : 100);
    return <Logo top={top} left={left} width={width} src={__PATH_PREFIX__ + '/assets/alpinfunk.svg'} />;
  }

  renderCurtain() {
    const curtainClosed = this.state.phase === 'intro' || this.state.phase === 'outro'
    const opacity = curtainClosed ? 1 : 0;
    return <Curtain opacity={opacity} />;
  }

  buildGpxPath() {
    return __PATH_PREFIX__ + '/tracks' + this.getReportPath() + '.gpx';
  }

  renderMap() {
    const {type, track, timeShift, detailMap, hideSwissTopo} = this.props.data.reportJson;
    return track && <Map
      gpxPath={this.buildGpxPath()}
      time={this.getTargetTime()}
      timeShift={timeShift}
      detailMap={detailMap}
      hideSwissTopo={hideSwissTopo}
      winter={type !== 'hike'}
      noUserInterface={true}
      onTimeReached={this.nextPhase}
    />
  }

  render() {
    const reportJson = this.props.data.reportJson;
    reportJson.landmarks = reportJson.landmarks.filter(landmark => {
      return landmark.photos.length > 0;
    });
    return (
      <Movie id='movie'>
        <Helmet>
          <link rel="canonical" href={`/alpine${this.getReportPath()}`} />
          <meta name="robots" content="noindex" />
        </Helmet>
        {this.renderCurtain()}
        {this.renderLogo()}
        {this.renderTitle()}
        {this.renderMap()}
        {this.props.data.reportJson.landmarks.map(this.renderLandmark)}
      </Movie>
    );
  }
}

export default ReportMovie;

export const pageQuery = graphql`
  query ReportMovieByDestinationAndDate($destination: String!, $date: String!) {
    reportJson(destination: {eq: $destination}, date: {eq: $date}) {
      destination, 
      date, 
      type, 
      track, 
      timeShift, 
      detailMap, 
      hideSwissTopo, 
      title,
      shortTitle,
      title3d {
        offsetY,
        fontSize,
        align,
      },
      landmarks {
        photos {name, alt}, 
      }
    }
  }
`;
