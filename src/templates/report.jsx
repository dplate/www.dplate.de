import React from 'react';
import styled from 'styled-components';
import MapButton from '../components/MapButton.jsx';
import Title3D from '../components/Title3d.jsx';
import { videoContainerStyle } from '../styles/basestyle.js';
import formatDate from '../utils/formatDate';
import gpxIcon from '../icons/gpx.svg';
import { graphql, Link } from 'gatsby';
import Layout from '../components/Layout.jsx';
import Video from '../components/Video.jsx';

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

const PhotoContainer = styled.a`
  display: block;
  margin: 5px 0;
`;

const Photo = styled.img`
  display: inline-block;
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: scale-down;
  object-position: left top;
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

const getReportPath = (destination, date) => {
  return '/' + destination + '/' + date.substring(1);
};

const buildPageTitle = (title, type) => {
  if (type === 'hike') {
    return `⛰ ${title} Wanderung`;
  }
  if (type === 'winterHike') {
    return `⛰ ${title} Winterwanderung`;
  }
  return `⛷ ${title} Skigebiet`;
};

const buildPageDescription = (title, type, date) => {
  if (type === 'hike' || type === 'winterHike') {
    return `⛰ Wandern ${title} vom ${formatDate(date)} mit vielen Fotos, ausführlicher Wegbeschreibung und Wanderkarte`;
  }
  return `⛷ Skigebiet ${title} am ${formatDate(
    date
  )} mit vielen Fotos, Pistenplan und Beschreibung der Abfahrten/Schneeverhältnisse`;
};

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

  renderPhoto(reportPath, photo, index) {
    let fileName = photo.name;
    if (process.env.NODE_ENV === `production` && photo.alt) {
      fileName = photo.alt.split(' ').join('-').toLowerCase() + '_' + photo.name;
    }

    const photoPath = '/photos' + reportPath + '/' + fileName + '.jpg';
    return (
      <PhotoContainer
        href={'#' + fileName}
        key={index}
        style={{
          aspectRatio: `${photo.width} / ${photo.height}`,
          maxWidth: `${photo.width}px`,
          maxHeight: `min(${photo.height}px, calc(100vh - 125px))`
        }}
      >
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
      </PhotoContainer>
    );
  }

  renderVideo(video, index) {
    return (
      <VideoContainer key={index}>
        <Video title={video} video={video} />
      </VideoContainer>
    );
  }

  renderLandmark(reportPath, landmark, index) {
    return (
      <Landmark key={index} className="landmark">
        {landmark.photos && landmark.photos.map(this.renderPhoto.bind(this, reportPath))}
        {landmark.videos && landmark.videos.map(this.renderVideo.bind(this))}
        <Chapter dangerouslySetInnerHTML={{ __html: landmark.text }} />
      </Landmark>
    );
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
    const {
      destination,
      date,
      type,
      track,
      timeShift,
      detailMap,
      hideSwissTopo,
      title,
      title3d,
      movie,
      intro,
      landmarks,
      outro
    } = content;
    const reportPath = getReportPath(destination, date);
    const gpxPath = '/tracks' + reportPath + '.gpx';
    const fullTitle = title + ' ' + formatDate(date);
    const pageTitle = buildPageTitle(title, type);
    return (
      <Layout location={this.props.location}>
        <Content>
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
          {landmarks.map(this.renderLandmark.bind(this, reportPath))}
          <Chapter dangerouslySetInnerHTML={{ __html: outro }} />
          {track && this.renderGpxDownload(gpxPath)}
          {track && this.state.time && (
            <MapButton
              time={this.state.time}
              reportPath={reportPath}
              mapProps={{
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
              <p>
                Hast du noch Fragen? Dann benutze die Kommentare auf YouTube:
                <br />
                <a href={`https://youtu.be/${movie}`}>{pageTitle} auf YouTube</a>.
              </p>
              <p>Natürlich freue ich mich auch über jeden "Like" dort, falls dir der Bericht gefallen hat. 🙂</p>
              <VideoContainer style={{ marginTop: '10px' }}>
                <Video title={title} video={movie} />
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

const createStructuredData = (reportJson) => {
  const { destination, date, type, title, landmarks } = reportJson;
  const pageTitle = buildPageTitle(title, type);
  const reportPath = getReportPath(destination, date);
  const allPhotos = landmarks.reduce((photos, landmark) => [...photos, ...landmark.photos], []);
  const selectedPhotos = new Set();
  selectedPhotos.add(allPhotos[Math.round(allPhotos.length * 0.3)]);
  selectedPhotos.add(allPhotos[Math.round(allPhotos.length * 0.5)]);
  selectedPhotos.add(allPhotos[Math.round(allPhotos.length * 0.7)]);
  const photoUrls = [...selectedPhotos].map((photo) => {
    const fileName = photo.alt ? photo.alt.split(' ').join('-').toLowerCase() + '_' + photo.name : photo.name;
    return 'https://www.dplate.de/photos' + reportPath + '/' + fileName + '.jpg';
  });
  const fallbackDate = date.substring(1, 5) + '-' + date.substring(5, 7) + '-' + date.substring(7, 9);
  const photoDate = allPhotos[Math.round(allPhotos.length * 0.5)]?.date;

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: pageTitle,
    image: photoUrls,
    datePublished: photoDate || fallbackDate,
    author: [
      {
        '@type': 'Organization',
        name: 'AlpinFunk',
        url: 'https://www.dplate.de'
      }
    ]
  });
};

export const Head = (props) => {
  const { destination, date, type, title, title3d, movie } = props.data.reportJson;
  const pageTitle = buildPageTitle(title, type);
  const reportPath = getReportPath(destination, date);
  return (
    <>
      <title>{pageTitle}</title>
      <script type="application/ld+json">{createStructuredData(props.data.reportJson)}</script>
      <meta name="description" property="og:description" content={buildPageDescription(title, type, date)} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={`https://www.dplate.de/alpine${reportPath}`} />
      <meta name="robots" content="max-image-preview:large" />
      {title3d && <meta property="og:image" content={`https://www.dplate.de/photos${reportPath}/title.jpg`} />}
      {movie && <meta property="og:video" content={`https://youtu.be/${movie}`} />}
      {movie && <meta property="og:video:height" content="1920" />}
      {movie && <meta property="og:video:width" content="1080" />}
    </>
  );
};

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
