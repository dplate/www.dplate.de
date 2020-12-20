import React from 'react'
import Map from '../components/map'
import {graphql} from 'gatsby'
import {EXIF} from '../external/exif-js/exif.js';
import styled, {css} from 'styled-components';

const Landmark = styled.div`
`;

const Photo = styled.img`
  position: absolute;
  display: block;
  box-shadow: 0 0 400px 200px #000000;
  z-index: 5;
  max-width: 100%;
  max-height: 100%;
  top: 50%;
  left: 50%;
  margin-right: -50%;
  transform: translate(-50%, -50%);
  ${props => props.show ? css`opacity: 1;` : css`opacity: 0;`};
  transition: opacity 500ms ease-out;
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
    console.log(this.state.phase, this.state.photo)
    switch (this.state.phase) {
      case 'intro':
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
        self.nextPhase();
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

  getReportPath() {
    return '/' + this.props.data.reportJson.destination + '/' + this.props.data.reportJson.date.substring(1);
  }

  renderPhoto(photo, index) {
    const fileName = photo.name;
    const photoPath = __PATH_PREFIX__ + '/photos' + this.getReportPath() + '/' + fileName + '.jpg';
    return <Photo
        key={index}
        id={fileName}
        src={photoPath}
        alt={photo.alt}
        show={this.state.phase === 'photo' && this.state.photo.name === fileName}
    />;
  }

  renderLandmark(landmark, index) {
    return (
      <Landmark key={index} className="landmark">
        {landmark.photos && landmark.photos.map(this.renderPhoto.bind(this))}
      </Landmark>
    )
  }

  render() {
    const content = this.props.data.reportJson;
    const {type, track, timeShift, detailMap, hideSwissTopo, landmarks} = content;
    const gpxPath = __PATH_PREFIX__ + '/tracks' + this.getReportPath() + '.gpx';
    return (
      <div id='movie'>
        {track && <Map
          gpxPath={gpxPath}
          time={this.getTargetTime()}
          timeShift={timeShift}
          detailMap={detailMap}
          hideSwissTopo={hideSwissTopo}
          winter={type !== 'hike'}
          noUserInterface={true}
          onTimeReached={this.nextPhase}
         />}
        {landmarks.map(this.renderLandmark)}
      </div>
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
      landmarks {
        photos {name, alt}, 
      }
    }
  }
`;
