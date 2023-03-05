import React, { Suspense, useState, useEffect, useMemo, useCallback } from 'react';
import { graphql } from 'gatsby';
import styled from 'styled-components';
import formatDate from '../utils/formatDate.js';
import AnimatedTitle from '../components/AnimatedTitle.jsx';
import Landmarks from '../components/reportMovie/Landmarks.jsx';
import Logo from '../components/reportMovie/Logo.jsx';
import Curtain from '../components/reportMovie/Curtain.jsx';
import HeightGraph from '../components/reportMovie/HeightGraph.jsx';
import YoutubeMetadata from '../components/reportMovie/YoutubeMetadata.jsx';
import Soundtrack from '../components/reportMovie/Soundtrack.jsx';
import loadTrack from '../utils/loadTrack.js';
const Map = React.lazy(() => import('../components/Map.jsx'));

const Movie = styled.div`
  position: fixed;
  width: 100vw;
  height: 100vh;
  color: white;
`;

const photoDuration = 5000;

const getReportPath = (destination, date) => {
  return '/' + destination + '/' + date.substring(1);
};

const findNextPhoto = (landmarks, currentPhoto) => {
  for (let landmarkIndex = 0; landmarkIndex < landmarks.length; landmarkIndex++) {
    const photos = landmarks[landmarkIndex].photos;
    for (let photoIndex = 0; photoIndex < photos.length; photoIndex++) {
      if (photos[photoIndex] === currentPhoto) {
        if (photos[photoIndex + 1]) {
          return photos[photoIndex + 1];
        } else if (landmarks[landmarkIndex + 1]) {
          return landmarks[landmarkIndex + 1].photos[0];
        }
      }
    }
  }
  return undefined;
};

const nextPhase = (phase, setPhase, nextPhoto, setNextPhoto, landmarks) => {
  switch (phase.name) {
    case 'loading':
      setPhase({ name: 'intro', forDuration: null });
      break;
    case 'intro':
      setPhase({ name: 'introScroll', forDuration: 5000 });
      break;
    case 'introScroll':
      setPhase({ name: 'map', forDuration: null });
      setNextPhoto(landmarks[0].photos[0]);
      break;
    case 'map':
      if (nextPhoto) {
        setPhase({ name: 'photo', forDuration: photoDuration });
      } else {
        setPhase({ name: 'outro', forDuration: null });
      }
      break;
    case 'photo':
      const newNextPhoto = findNextPhoto(landmarks, nextPhoto);
      setNextPhoto(newNextPhoto);
      if (nextPhoto.date !== newNextPhoto?.date) {
        setPhase({ name: 'map', forDuration: null });
      } else {
        setPhase({ name: 'photo', forDuration: photoDuration });
      }
      break;
    default:
      break;
  }
};

const getTargetTime = (phase, nextPhoto) => {
  switch (phase.name) {
    case 'loading':
    case 'intro':
    case 'introScroll':
      return 'start';
    case 'map':
    case 'photo':
      if (nextPhoto) {
        return nextPhoto.date;
      } else {
        return 'end';
      }
    default:
      return 'end';
  }
};

const ReportMovie = ({ data: { reportJson } }) => {
  const { destination, date, timeShift, detailMap, hideSwissTopo, type, title, shortTitle, title3d } = reportJson;
  const reportPath = getReportPath(destination, date);

  const [track, setTrack] = useState(null);
  const [phase, setPhase] = useState({ name: 'loading', forDuration: null });
  const [nextPhoto, setNextPhoto] = useState(undefined);
  const [time, setTime] = useState(null);

  useEffect(() => {
    loadTrack(reportPath).then(setTrack);
  }, [reportPath]);

  const landmarks = useMemo(
    () =>
      reportJson.landmarks.map(landmark => ({
        ...landmark,
        photos: landmark.photos.filter(photo => photo.date)
      })).filter((landmark) => {
        return landmark.photos.length > 0;
      }),
    [reportJson]
  );

  const callNextPhase = useCallback(() => {
    nextPhase(phase, setPhase, nextPhoto, setNextPhoto, landmarks);
  }, [phase, setPhase, nextPhoto, setNextPhoto, landmarks]);

  useEffect(() => {
    if (phase.forDuration) {
      const timeout = window.setTimeout(() => {
        callNextPhase();
      }, phase.forDuration);
      return () => {
        window.clearTimeout(timeout);
      };
    }
  }, [phase, callNextPhase]);

  const timeIndependentComponents = useMemo(
    () => (
      <>
        <Curtain closed={phase.name === 'loading' || phase.name === 'intro' || phase.name === 'outro'} />
        <Logo
          introActive={phase.name === 'loading' || phase.name === 'intro'}
          outroActive={phase.name === 'outro'}
          onClick={phase.name === 'intro' ? callNextPhase : null}
        />
        <AnimatedTitle
          reportPath={reportPath}
          title={title + ' - ' + formatDate(date)}
          title3d={title3d}
          visible={phase.name === 'loading' || phase.name === 'intro'}
        />
        <Suspense fallback={null}>
          <Map
            track={track}
            wishTime={getTargetTime(phase, nextPhoto)}
            timeShift={timeShift}
            detailMap={detailMap}
            hideSwissTopo={hideSwissTopo}
            winter={type !== 'hike'}
            onWishTimeReached={callNextPhase}
            onTimeChanged={setTime}
            size="fullscreen"
          />
        </Suspense>
        <Landmarks
          landmarks={landmarks}
          reportPath={reportPath}
          visiblePhotoName={phase.name === 'photo' ? nextPhoto.name : null}
        />
        <YoutubeMetadata
          date={date}
          title={title}
          shortTitle={shortTitle}
          reportPath={reportPath}
          phaseName={phase.name}
          nextPhoto={nextPhoto}
        />
      </>
    ),
    [
      date,
      detailMap,
      hideSwissTopo,
      shortTitle,
      timeShift,
      title,
      title3d,
      type,
      track,
      landmarks,
      reportPath,
      phase,
      nextPhoto,
      callNextPhase
    ]
  );

  return (
    <Movie id="movie">
      {timeIndependentComponents}
      {track && <HeightGraph visible={phase.name === 'map'} track={track} time={time} />}
      {track && <Soundtrack phaseName={phase.name} track={track} time={time} />}
    </Movie>
  );
};

export const Head = (props) => {
  const { destination, date } = props.data.reportJson;
  const reportPath = getReportPath(destination, date);
  return (
    <>
      <link rel="canonical" href={`/alpine${reportPath}`} />
      <meta name="robots" content="noindex" />
    </>
  );
};

export default ReportMovie;

export const pageQuery = graphql`
  query ReportMovieByDestinationAndDate($destination: String!, $date: String!) {
    reportJson(destination: { eq: $destination }, date: { eq: $date }, track: { eq: true }) {
      destination
      date
      type
      track
      timeShift
      detailMap
      hideSwissTopo
      title
      shortTitle
      title3d {
        offsetY
        fontSize
        width
        height
        align
      }
      landmarks {
        photos {
          name
          alt
          date
        }
      }
    }
  }
`;
