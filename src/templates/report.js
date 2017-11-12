import React from 'react'
import { Helmet } from 'react-helmet'
import styled from 'styled-components'
import { EXIF } from '../external/exif-js/exif'
import Map from '../components/map'
import {videoWrapperStyle, videoContainerStyle} from '../styles/basestyle.js'
import formatDate from '../utils/formatDate'

const Content = styled.div`
  display: block;
  margin: 16px;
  color: white;
  
  a {
    color: #CFE0C3;
    &:visited: {
      color: #9EC1A3;
    }
  }
`;

const Chapter = styled.p`
  max-width: 800px;
`;

const Landmark = styled.div`
  margin: 0 0 25px 0;
`;

const Photo = styled.img`
  position: relative;
  display: block;
  max-width: 100%;
  max-height: calc(100vh - 125px);
  margin: 10px 0;
  cursor: pointer;
  &.focus {
    z-index: 2;
    box-shadow: 0 0 20px 0 rgba(0,0,0,0.75);
  }
  transition: box-shadow 0.3s ease-in-out;
`;

const VideoContainer = styled.div`
  ${videoContainerStyle}
  margin: 0;
  z-index: 2;
  position: relative;
`;

const VideoWrapper = styled.div`
  ${videoWrapperStyle}
`;

class Report extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      time: undefined,
      focus: undefined
    };
    this.scrollHandler = this.scrollHandler.bind(this);
    this.enableScrollHandler = this.enableScrollHandler.bind(this);
  }

  componentDidMount() {
    //window.addEventListener('load', this.enableScrollHandler);
    this.retrieveImageDates();
  }

  componentWillUnmount() {
   // window.removeEventListener('load', this.enableScrollHandler);
    window.removeEventListener('scroll', this.scrollHandler);
  }

  enableScrollHandler() {
    if (window.location.hash !== '') {
      window.location.href = window.location.hash;
    }
    window.addEventListener('scroll', this.scrollHandler);
    this.scrollHandler();
  }

  retrieveImageDate(image) {
    const self = this;
    EXIF.getData(image, function() {
      const exifDate = EXIF.getTag(this, 'DateTimeOriginal');
      if (exifDate) {
        const [date, time] = exifDate.split(' ');
        image.setAttribute('data-time', date.replace(/:/g, '-') + 'T' + time);
      }
      self.images.push(image);
      self.images.sort((image1, image2) => image1.offsetTop - image2.offsetTop);
      if (self.images.length >= self.requiredImages.length) {
        self.enableScrollHandler();
      }
    });
  }

  retrieveImageDates() {
    this.images = [];
    this.requiredImages = [];
    const imgElements = document.querySelectorAll('.landmark img');
    for (let i=0, image; image = imgElements[i]; i++) {
      this.requiredImages.push(image);
      if (image.complete) {
        this.retrieveImageDate(image);
      } else {
        image.onload = this.retrieveImageDate.bind(this, image);
      }
    }
  }

  scrollHandler() {
    if (this.images.length > 0) {
      if (window.pageYOffset < this.images[0].offsetTop ) {
        this.setState({time: 'start'});
        return;
      }

      if (window.pageYOffset > this.images[this.images.length - 1].offsetTop + 500 ) {
        this.setState({time: 'end'});
        return;
      }

      let time;
      let id;
      let minDistance = Number.MAX_SAFE_INTEGER;
      this.images.forEach((image) => {
        const distance = Math.abs(window.pageYOffset  - image.offsetTop);
        if (distance < minDistance) {
          minDistance = distance;
          time = image.getAttribute('data-time');
          id = image.getAttribute('id');
        }
      });
      if (time) {
        this.setState({time});
      }
      if (id && location.hash !== '#' + id) {
        if(history.replaceState) {
          history.replaceState(null, null, '#' + id);
        }
        else {
          location.hash = '#' + id;
        }
      }
    }
  }

  toggleFocus(medium) {
    this.setState({
      focus: this.state.focus === medium ? undefined : medium
    })
  }

  resetFocus() {
    this.setState({
      focus: undefined
    })
  }

  renderPhoto(photo, index) {
    let fileName = photo.name;
    if (process.env.NODE_ENV === `production` && photo.alt) {
      fileName = photo.alt.split(' ').join('-').toLowerCase() + '_' + photo.name;
    }

    const photoPath = __PATH_PREFIX__ + '/photos' + this.getReportPath() + '/' + fileName + '.jpg';
    return <a href={'#' + fileName} key={index}>
      <Photo
        id={fileName}
        src={photoPath}
        alt={photo.alt}
        className={this.state.focus === photo ? 'focus' : undefined}
        onClick={this.toggleFocus.bind(this, photo)}
      />
    </a>;
  }

  renderVideo(video, index) {
    return (
      <VideoContainer key={index}>
        <VideoWrapper>
          <iframe src={`http://www.youtube.com/embed/${video}?wmode=transparent`} frameBorder="0" allowFullScreen />
        </VideoWrapper>
      </VideoContainer>
    );
  }

  renderLandmark(landmark, index) {
    return (
      <Landmark key={index} className="landmark">
        {landmark.photos && landmark.photos.map(this.renderPhoto.bind(this))}
        {landmark.videos && landmark.videos.map(this.renderVideo.bind(this))}
        <Chapter dangerouslySetInnerHTML={{ __html: landmark.text }} />
      </Landmark>
    )
  }

  getReportPath() {
    return '/' + this.props.data.reportJson.destination + '/' + this.props.data.reportJson.date.substring(1);
  }

  buildPageTitle(title, type) {
    if (type === 'hike') {
      return `⛰ ${title} Wanderung`;
    }
    return `⛷ ${title} Skigebiet`;
  }

  buildPageDescription(title, type, date) {
    if (type === 'hike') {
      return `⛰ Wanderbericht ${title} vom ${formatDate(date)} mit vielen Fotos, ausführlicher Wegbeschreibung und Wanderkarte`;
    }
    return `⛷ Skigebiet ${title} am ${formatDate(date)} mit vielen Fotos, Pistenplan und Beschreibung der Abfahrten/Schneeverhältnisse`;
  }


  render() {
    const content = this.props.data.reportJson;
    const {date, type, track, timeShift, hideSwissMap, hideSwissTopo, title, intro, landmarks, outro} = content;
    return (
      <Content>
        <Helmet>
          <title>{this.buildPageTitle(title, type)}</title>
          <meta name="description" content={this.buildPageDescription(title, type, date)} />
        </Helmet>
        <h1>{title} - {formatDate(date)}</h1>
        <Chapter dangerouslySetInnerHTML={{__html: intro}}/>
        {landmarks.map(this.renderLandmark.bind(this))}
        <Chapter dangerouslySetInnerHTML={{__html: outro}}/>
        {track && this.state.time && <Map
          gpxPath={__PATH_PREFIX__ + '/tracks' + this.getReportPath() + '.gpx'}
          time={this.state.time}
          timeShift={timeShift}
          hideSwissMap={hideSwissMap}
          hideSwissTopo={hideSwissTopo}
          winter={type !== 'hike'}
          onClick={this.resetFocus.bind(this)}
         />}
      </Content>
    );
  }
}

export default Report;

export const pageQuery = graphql`
  query ReportByDestinationAndDate($destination: String!, $date: String!) {
    reportJson(destination: {eq: $destination}, date: {eq: $date}) {
      destination, date, type, track, timeShift, hideSwissMap, hideSwissTopo, title, intro, landmarks {photos {name, alt}, videos, text}, outro
    }
  }
`;
