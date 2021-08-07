import React from 'react';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import MapButton from '../components/mapbutton.jsx';
import Title3D from '../components/title3d.jsx';
import { videoContainerStyle, videoWrapperStyle } from '../styles/basestyle.js';
import formatDate from '../utils/formatDate';
import gpxIcon from '../icons/gpx.svg';
import { graphql, Link } from 'gatsby';
import Layout from '../components/layout.jsx';

const Content = styled.div`
  display: block;
  margin: 16px;
  color: white;

  a {
    color: #cfe0c3;

    &:visited {
      color: #9ec1a3;
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
  width: auto;
  height: auto;
  margin: 10px 0;
  cursor: pointer;

  &.focus {
    z-index: 2;
    box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.75);
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
  background-color: #cfe0c3;
  border: 3px solid #40798c;
  border-radius: 5px;
  width: 60px;

  &:hover {
    background-color: #9ec1a3;
  }
`;

const Ad = styled.div`
  margin-top: 50px;

  img {
    display: inline-block;
    max-width: min(640px, 100%);
    width: auto;
    height: auto;
    margin-top: 20px;
    margin-bottom: 20px;
  }
`;

const Movie = styled.div`
  margin-top: 20px;
  h3 {
    margin-bottom: 10px;
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
  }

  componentDidMount() {
    if (window.location.hash !== '') {
      window.location.href = window.location.hash;
    }
    window.addEventListener('scroll', this.scrollHandler);
    this.scrollHandler();
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.scrollHandler);
  }

  changeHash(id) {
    if (id) {
      const hash = '#' + id;
      if (window.location.hash !== hash) {
        if (window.history.replaceState) {
          window.history.replaceState(null, null, hash);
        } else {
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
    const images = document.querySelectorAll('.landmark img');
    if (images.length > 0) {
      if (window.pageYOffset < images[0].offsetTop) {
        this.setState({ time: 'start' });
        this.changeHash();
        return;
      }

      if (window.pageYOffset > images[images.length - 1].offsetTop + 500) {
        this.setState({ time: 'end' });
        this.changeHash();
        return;
      }

      let time;
      let id = null;
      let minDistance = Number.MAX_SAFE_INTEGER;
      images.forEach((image) => {
        const distance = Math.abs(window.pageYOffset - image.offsetTop);
        if (distance < minDistance) {
          minDistance = distance;
          time = image.getAttribute('data-date');
          id = image.getAttribute('id');
        }
      });
      if (time) {
        this.setState({ time });
      }
      this.changeHash(id);
    }
  }

  toggleFocus(medium) {
    this.setState({
      focus: this.state.focus === medium ? undefined : medium
    });
  }

  resetFocus() {
    this.setState({
      focus: undefined
    });
  }

  renderPhoto(photo, index) {
    let fileName = photo.name;
    if (process.env.NODE_ENV === `production` && photo.alt) {
      fileName = photo.alt.split(' ').join('-').toLowerCase() + '_' + photo.name;
    }

    const photoPath = '/photos' + this.getReportPath() + '/' + fileName + '.jpg';
    return (
      <a href={'#' + fileName} key={index}>
        <Photo
          id={fileName}
          src={photoPath}
          loading="lazy"
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          data-date={photo.date}
          className={this.state.focus === photo ? 'focus' : undefined}
          onClick={this.toggleFocus.bind(this, photo)}
        />
      </a>
    );
  }

  renderVideo(video, index) {
    return (
      <VideoContainer key={index}>
        <VideoWrapper>
          <iframe
            loading="lazy"
            src={`https://www.youtube.com/embed/${video}?wmode=transparent`}
            frameBorder="0"
            allowFullScreen
            title={video}
          />
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
    );
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
      return `⛰ Wandern ${title} vom ${formatDate(
        date
      )} mit vielen Fotos, ausführlicher Wegbeschreibung und Wanderkarte`;
    }
    return `⛷ Skigebiet ${title} am ${formatDate(
      date
    )} mit vielen Fotos, Pistenplan und Beschreibung der Abfahrten/Schneeverhältnisse`;
  }

  renderGpxDownload(gpxPath) {
    const downloadName =
      'www-dplate-de-' +
      this.props.data.reportJson.destination +
      '-' +
      this.props.data.reportJson.date.substring(1) +
      '.gpx';
    return (
      <GpxDownload
        href={gpxPath}
        download={downloadName}
        onClick={() => {
          // noinspection JSUnresolvedVariable
          window.ga && window.ga('send', 'event', 'gpxDownload', 'click');
        }}
      >
        <img src={gpxIcon} alt="Download GPX Track" title="Download GPX Track" width="50px" height="50px" />
      </GpxDownload>
    );
  }

  render() {
    const content = this.props.data.reportJson;
    const { date, type, track, timeShift, detailMap, hideSwissTopo, title, title3d, movie, intro, landmarks, outro } =
      content;
    const reportPath = this.getReportPath();
    const gpxPath = '/tracks' + reportPath + '.gpx';
    const fullTitle = title + ' - ' + formatDate(date);
    const pageTitle = this.buildPageTitle(title, type);
    return (
      <Layout location={this.props.location}>
        <Content>
          <Helmet>
            <title>{pageTitle}</title>
            <meta name="description" property="og:description" content={this.buildPageDescription(title, type, date)} />
            <meta property="og:title" content={pageTitle} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={`https://www.dplate.de/alpine${reportPath}`} />
            {title3d && <meta property="og:image" content={`https://www.dplate.de/photos${reportPath}/title.jpg`} />}
            {movie && <meta property="og:video" content={`https://youtu.be/${movie}`} />}
            {movie && <meta property="og:video:height" content="1920" />}
            {movie && <meta property="og:video:width" content="1080" />}
          </Helmet>
          {!title3d && <h1>{fullTitle}</h1>}
          {title3d && (
            <Title3D
              reportPath={reportPath}
              title={fullTitle}
              offsetY={title3d.offsetY}
              fontSize={title3d.fontSize}
              width={title3d.width}
              height={title3d.height}
              align={title3d.align}
            />
          )}
          <Chapter dangerouslySetInnerHTML={{ __html: intro }} />
          {landmarks.map(this.renderLandmark.bind(this))}
          <Chapter dangerouslySetInnerHTML={{ __html: outro }} />
          {track && this.renderGpxDownload(gpxPath)}
          {track && this.state.time && (
            <MapButton
              time={this.state.time}
              mapProps={{
                gpxPath,
                timeShift,
                detailMap,
                hideSwissTopo,
                winter: type !== 'hike',
                onClick: this.resetFocus.bind(this)
              }}
            />
          )}
          {movie && (
            <Movie>
              <h3>
                <a href={`https://youtu.be/${movie}`}>{pageTitle} als Animation</a>
              </h3>
              <VideoContainer>
                <VideoWrapper>
                  <iframe
                    src={`https://www.youtube.com/embed/${movie}?wmode=transparent`}
                    frameBorder="0"
                    allowFullScreen
                    title={title}
                  />
                </VideoWrapper>
              </VideoContainer>
            </Movie>
          )}
          <Ad>
            <h2>Zu schlechtes Wetter um selbst in die Berge zu gehen?</h2>
            <Link to="/games/draw-a-mountain">
              <img src="/screenshots/draw-a-mountain.jpg" alt="Draw-A-Mountain" width="1024" height="500" />
            </Link>
            <p>
              Probiere doch mein kostenloses Spiel <Link to="/games/draw-a-mountain">"Draw-A-Mountain"</Link> aus.
            </p>
          </Ad>
        </Content>
      </Layout>
    );
  }
}

export default Report;

export const pageQuery = graphql`
  query ReportByDestinationAndDate($destination: String!, $date: String!) {
    reportJson(destination: { eq: $destination }, date: { eq: $date }) {
      destination
      date
      type
      track
      timeShift
      detailMap
      hideSwissTopo
      title
      title3d {
        offsetY
        fontSize
        align
        width
        height
      }
      movie
      intro
      landmarks {
        photos {
          name
          alt
          date
          width
          height
        }
        videos
        text
      }
      outro
    }
  }
`;
