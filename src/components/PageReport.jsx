import React from 'react';
import MapButton from './mapbutton.jsx';
import Title3D from './Title3d.jsx';
import Video from './Video.jsx';
import formatDate from '../utils/formatDate';
import gpxIcon from '../icons/gpx.svg?url';
import Link from './Link.jsx';
import { videoContainerStyle } from '../styles/basestyle.js';
import styles from './PageReport.module.css';
import getReportPath from '../utils/getReportPath.js';

const buildPageTitle = (title, type) => {
  if (type === 'hike') {
    return `⛰ ${title} Wanderung`;
  }
  if (type === 'winterHike') {
    return `⛰ ${title} Winterwanderung`;
  }
  return `⛷ ${title} Skigebiet`;
};

class PageReport extends React.Component {
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
      if (window.scrollY < images[0].offsetTop) {
        this.setState({ time: 'start' });
        this.changeHash();
        return;
      }

      if (window.scrollY > images[images.length - 1].offsetTop + 500) {
        this.setState({ time: 'end' });
        this.changeHash();
        return;
      }

      let time;
      let id = null;
      let minDistance = Number.MAX_SAFE_INTEGER;
      images.forEach((image) => {
        const distance = Math.abs(window.scrollY - image.offsetTop);
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
      <a
        className={styles.photoContainer}
        href={'#' + fileName}
        key={index}
        style={{
          aspectRatio: `${photo.width} / ${photo.height}`,
          maxWidth: `${photo.width}px`,
          maxHeight: `min(${photo.height}px, calc(100vh - 125px))`
        }}
      >
        <img
          id={fileName}
          src={photoPath}
          loading="lazy"
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          data-date={photo.date}
          className={`${styles.photo} ${this.state.focus === photo ? 'focus' : ''}`}
          onClick={this.toggleFocus.bind(this, photo)}
        />
      </a>
    );
  }

  renderVideo(video, index) {
    return (
        <div key={index} className={`${videoContainerStyle} ${styles.videoContainer}`}>
        <Video title={video} video={video} />
      </div>
    );
  }

  renderLandmark(reportPath, landmark, index) {
    return (
      <div key={index} className={`${styles.landmark} landmark`}>
        {landmark.photos && landmark.photos.map(this.renderPhoto.bind(this, reportPath))}
        {landmark.videos && landmark.videos.map(this.renderVideo.bind(this))}
        <section dangerouslySetInnerHTML={{ __html: landmark.text }} />
      </div>
    );
  }

  renderGpxDownload(gpxPath) {
    const downloadName =
      'www-dplate-de-' +
      this.props.data.reportJson.destination +
      '-' +
      this.props.data.reportJson.date +
      '.gpx';
    return (
      <a
        className={styles.gpxDownload}
        href={gpxPath}
        download={downloadName}
        onClick={() => {
          window.gtag('event', 'gpxDownload');
        }}
      >
        <img src={gpxIcon} alt="Download GPX Track" title="Download GPX Track" width="50px" height="50px" />
      </a>
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
      <div className={styles.content}>
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
        <section dangerouslySetInnerHTML={{ __html: intro }} />
        {landmarks.map(this.renderLandmark.bind(this, reportPath))}
        <section dangerouslySetInnerHTML={{ __html: outro }} />
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
          <div className={styles.movie}>
            <p>
              Hast du noch Fragen? Dann benutze die Kommentare auf YouTube:
              <br />
              <a href={`https://youtu.be/${movie}`}>{pageTitle} auf YouTube</a>.
            </p>
            <p>Natürlich freue ich mich auch über jeden "Like" dort, falls dir der Bericht gefallen hat. 🙂</p>
            <div className={`${videoContainerStyle} ${styles.videoContainer}`} style={{ marginTop: '10px' }}>
              <Video title={title} video={movie} />
            </div>
          </div>
        )}
        <div className={styles.ad}>
          <h2>Zu schlechtes Wetter um selbst in die Berge zu gehen?</h2>
          <Link to="/games/draw-a-mountain">
            <img src="/screenshots/draw-a-mountain.jpg" alt="Draw-A-Mountain" width="1024" height="500" />
          </Link>
          <p>
            Probiere doch mein kostenloses Spiel <Link to="/games/draw-a-mountain">"Draw-A-Mountain"</Link> aus.
          </p>
        </div>
      </div>
    );
  }
}

export default PageReport;
