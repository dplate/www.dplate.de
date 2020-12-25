import React from 'react'
import { Helmet } from 'react-helmet'
import styled from 'styled-components'
import { EXIF } from '../external/exif-js/exif'
import Map from '../components/map'
import Title3D from '../components/title3d'
import {videoWrapperStyle, videoContainerStyle} from '../styles/basestyle.js'
import formatDate from '../utils/formatDate'
import gpxIcon from '../icons/gpx.svg'
import {graphql, Link} from 'gatsby'
import Layout from '../components/layout'

const Content = styled.div`
  display: block;
  margin: 16px;
  color: white;
  
  a {
    color: #CFE0C3;
    &:visited {
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
  ${videoContainerStyle};
  margin: 0;
  z-index: 2;
  position: relative;
`;

const VideoWrapper = styled.div`
  ${videoWrapperStyle}
`;

const GpxDownload = styled.a`
  display: inline-block;
  margin: 20px 0 0 0;
  padding: 10px 10px 5px 17px;
  background-color: #CFE0C3;
  border: 3px solid #40798C;
  border-radius: 5px;
  width: 60px;

  &:hover {
    background-color: #9EC1A3;
  }
`;

const GpxDownloadIcon = styled.img`
  width: 50px;
  height: auto;
`;

const Ad = styled.div`
  margin-top: 50px;
  img {
    display: inline-block;
    max-width: min(640px, 100%);
    margin-top: 20px;  
    margin-bottom: 20px;
  }
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
    this.retrieveImageDates();
  }

  componentWillUnmount() {
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
    for (let i=0, image=null; (image = imgElements[i]); i++) {
      this.requiredImages.push(image);
      if (image.complete) {
        this.retrieveImageDate(image);
      } else {
        image.onload = this.retrieveImageDate.bind(this, image);
      }
    }
  }

  changeHash(id) {
    if (id) {
      const hash = '#' + id;
      if (window.location.hash !== hash) {
        if(window.history.replaceState) {
          window.history.replaceState(null, null, hash);
        }
        else {
          window.location.hash = hash;
        }
      }
    } else {
      if (window.location.hash && window.history.replaceState) {
        window.history.replaceState(null, null, window.location.pathname);
      }
    }

  }

  scrollHandler() {
    if (this.images.length > 0) {
      if (window.pageYOffset < this.images[0].offsetTop ) {
        this.setState({time: 'start'});
        this.changeHash();
        return;
      }

      if (window.pageYOffset > this.images[this.images.length - 1].offsetTop + 500 ) {
        this.setState({time: 'end'});
        this.changeHash();
        return;
      }

      let time;
      let id = null;
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
      this.changeHash(id);
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
          <iframe src={`https://www.youtube.com/embed/${video}?wmode=transparent`} frameBorder="0" allowFullScreen title={video} />
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
      return `⛰ Wandern ${title} vom ${formatDate(date)} mit vielen Fotos, ausführlicher Wegbeschreibung und Wanderkarte`;
    }
    return `⛷ Skigebiet ${title} am ${formatDate(date)} mit vielen Fotos, Pistenplan und Beschreibung der Abfahrten/Schneeverhältnisse`;
  }

  renderGpxDownload(gpxPath) {
    const downloadName = 'www-dplate-de-' + this.props.data.reportJson.destination + '-' + this.props.data.reportJson.date.substring(1) + '.gpx';
    return (
      <GpxDownload href={gpxPath} download={downloadName} onClick={() => {window.ga && window.ga('send', 'event', 'gpxDownload', 'click');}}>
        <GpxDownloadIcon src={gpxIcon} alt="Download GPX Track" title="Download GPX Track" />
      </GpxDownload>
    );
  }

  render() {
    const content = this.props.data.reportJson;
    const {date, type, track, timeShift, detailMap, hideSwissTopo, title, title3d, intro, landmarks, outro} = content;
    const gpxPath = __PATH_PREFIX__ + '/tracks' + this.getReportPath() + '.gpx';
    const fullTitle = title + ' - ' + formatDate(date);
    return (
      <Layout location={this.props.location}>
        <Content>
          <Helmet>
            <title>{this.buildPageTitle(title, type)}</title>
            <meta name="description" content={this.buildPageDescription(title, type, date)} />
          </Helmet>
          {!title3d && <h1>{fullTitle}</h1>}
          {title3d && <Title3D reportPath={this.getReportPath()} title={fullTitle} offsetY={title3d.offsetY} fontSize={title3d.fontSize} align={title3d.align} />}
          <Chapter dangerouslySetInnerHTML={{__html: intro}}/>
          {landmarks.map(this.renderLandmark.bind(this))}
          <Chapter dangerouslySetInnerHTML={{__html: outro}}/>
          {track && this.renderGpxDownload(gpxPath)}
          {track && this.state.time && <Map
            gpxPath={gpxPath}
            time={this.state.time}
            timeShift={timeShift}
            detailMap={detailMap}
            hideSwissTopo={hideSwissTopo}
            winter={type !== 'hike'}
            onClick={this.resetFocus.bind(this)}
           />}
           <Ad>
             <h2>Zu schlechtes Wetter um selbst in die Berge zu gehen?</h2>
             <Link to="/games/draw-a-mountain"><img src={__PATH_PREFIX__ + '/screenshots/draw-a-mountain.jpg'}  alt="Draw-A-Mountain"/></Link>
             <p>Probiere doch mein kostenloses Spiel <Link to="/games/draw-a-mountain">"Draw-A-Mountain"</Link> aus.</p>
           </Ad>
        </Content>
      </Layout>
    );
  }
}

export default Report;

export const pageQuery = graphql`
  query ReportByDestinationAndDate($destination: String!, $date: String!) {
    reportJson(destination: {eq: $destination}, date: {eq: $date}) {
      destination, 
      date, 
      type, 
      track, 
      timeShift, 
      detailMap, 
      hideSwissTopo, 
      title,
      title3d {
        offsetY,
        fontSize,
        align,
      },
      intro, 
      landmarks {
        photos {name, alt}, 
        videos, 
        text
      }, 
      outro
    }
  }
`;
