import React, {Fragment} from 'react'
import { Helmet } from 'react-helmet'
import Map from '../components/map'
import {graphql} from 'gatsby'
import {EXIF} from '../external/exif-js/exif.js';
import styled from 'styled-components';
import {Motion, spring} from 'react-motion';
import Title3D from '../components/title3d.js';
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

const Title = styled.div.attrs(({movePercent}) => ({
  style: ({ transform: `translate(0, -${movePercent}%)` })
}))`
  position: fixed;
  top: 0;
  width: 100vw;
  z-index: 6;
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

  outputMetadata() {
    const {date, destination, title, shortTitle} = this.props.data.reportJson;
    console.log({
      title: `⛰ ${title} Wanderung`,
      description: 'Wanderkarte und Bilder des Wegs ' + title + ' vom ' + formatDate(date) + '.\n' +
        '\n' +
        'Der ausführliche Bericht dieser Wanderung und der Download der GPX-Datei sind hier zu finden:\n' +
        'https://www.dplate.de/alpine' + this.getReportPath() + '\n' +
        '\n' +
        'Map engine:\n' +
        '- Cesium\n' +
        '\n' +
        'Data Attributions:\n' +
        '- Bing Imagery\n' +
        '- © 2020 Microsoft Corporation\n' +
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

  componentDidMount() {
    this.retrievePhotoDates();
    this.outputMetadata();
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
      const [date, time] = exifDate.split(' ');
      let allDatesRetrieved = true;
      self.props.data.reportJson.landmarks.forEach(landmark => {
        landmark.photos.forEach(photo => {
          if (photo.name === imgElement.id) {
            photo.date = date.replace(/:/g, '-') + 'T' + time
          }
          if (!photo.date) {
            allDatesRetrieved = false;
          }
        });
      });
      if (allDatesRetrieved) {
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

  renderMovingTitle(movePercent) {
    const {date, title, title3d} = this.props.data.reportJson;
    const fullTitle = title + ' - ' + formatDate(date);
    return <Title movePercent={movePercent}>
      {title3d ? <Title3D
        reportPath={this.getReportPath()}
        title={fullTitle}
        offsetY={title3d.offsetY}
        fontSize={title3d.fontSize}
        align={title3d.align}
        scrollTrigger={movePercent}
      /> : <h1>{fullTitle}</h1>}
    </Title>
  }

  renderTitle() {
    const introActive = this.state.phase === 'intro'
    return <Motion style={{
      movePercent: spring(introActive ? 0 : 120, { stiffness: 15 })
    }}>
      {({movePercent}) => this.renderMovingTitle(movePercent)}
    </Motion>;
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

  renderMap() {
    const {type, track, timeShift, detailMap, hideSwissTopo} = this.props.data.reportJson;
    const gpxPath = __PATH_PREFIX__ + '/tracks' + this.getReportPath() + '.gpx';
    return track && <Map
      gpxPath={gpxPath}
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
