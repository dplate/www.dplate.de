import React, { Suspense, useState, useEffect, useMemo, useCallback } from 'react';
import { graphql } from 'gatsby';
import styled from 'styled-components';
import formatDate from '../utils/formatDate.js';
import AnimatedTitle from '../components/AnimatedTitle.jsx';
import Photos from '../components/reportMovie/Photos.jsx';
import Logo from '../components/reportMovie/Logo.jsx';
import Curtain from '../components/reportMovie/Curtain.jsx';
import HeightGraph from '../components/reportMovie/HeightGraph.jsx';
import YoutubeMetadata from '../components/reportMovie/YoutubeMetadata.jsx';
import Soundtrack from '../components/reportMovie/Soundtrack.jsx';
import loadTrack from '../utils/loadTrack.js';
import Summary from '../components/reportMovie/Summary.jsx';
import setupAudio from '../utils/setupAudio';
const Map = React.lazy(() => import('../components/Map.jsx'));

const Movie = styled.div`
  position: fixed;
  width: 100vw;
  height: 100vh;
  color: white;
`;

const minPhotoDuration = 5;

const loadVoiceOver = async (audio, reportPath, name) => {
  const path = `/voiceOver${reportPath}/${name}.ogg`;
  return await audio.load(path);
};

const getReportPath = (destination, date) => {
  return '/' + destination + '/' + date.substring(1);
};

const findNextPhoto = (photos, currentPhoto) => {
  return photos[photos.indexOf(currentPhoto) + 1];
};

const nextPhase = async (audio, reportPath, phase, setPhase, nextPhoto, setNextPhoto, photos) => {
  switch (phase.name) {
    case 'loading':
      setPhase({ name: 'intro', forDuration: null });
      break;
    case 'intro':
      const voiceOver = await loadVoiceOver(audio, reportPath, 'intro');
      voiceOver && voiceOver.play();
      setPhase({ name: 'introScroll', forDuration: Math.max(5, voiceOver ? voiceOver.getDuration() : 0) });
      break;
    case 'introScroll':
      setPhase({ name: 'map', forDuration: null });
      setNextPhoto(photos[0]);
      break;
    case 'map':
      if (nextPhoto) {
        nextPhoto.voiceOver && nextPhoto.voiceOver.play();
        setPhase({ name: 'photo', forDuration: nextPhoto.duration });
      } else {
        const voiceOver = await loadVoiceOver(audio, reportPath, 'outro');
        voiceOver && voiceOver.play();
        setPhase({ name: 'outro', forDuration: null });
      }
      break;
    case 'photo':
      const newNextPhoto = findNextPhoto(photos, nextPhoto);
      setNextPhoto(newNextPhoto);
      if (nextPhoto.date !== newNextPhoto?.date) {
        setPhase({ name: 'map', forDuration: null });
      } else {
        nextPhoto.voiceOver && nextPhoto.voiceOver.play();
        setPhase({ name: 'photo', forDuration: nextPhoto.duration });
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

const preparePhotos = async (audio, reportPath, landmarks) => {
  const photos = [];
  for (const [landmarkIndex, landmark] of landmarks.entries()) {
    const validPhotos = landmark.photos.filter((photo) => photo.date);
    if (validPhotos.length > 0) {
      const voiceOver = await loadVoiceOver(audio, reportPath, String('0' + (landmarkIndex + 1)).slice(-2));
      const enhancedPhotos = validPhotos.map((photo, photoIndex) => ({
        ...photo,
        voiceOver: photoIndex === 0 ? voiceOver  : null,
        duration: Math.max(minPhotoDuration, voiceOver ? voiceOver.getDuration() / validPhotos.length : 0),
      }));
      photos.push(...enhancedPhotos);
    }
  }
  return photos;
};

const ReportMovie = ({ data: { reportJson } }) => {
  const { destination, date, timeShift, detailMap, hideSwissTopo, type, title, shortTitle, title3d } = reportJson;
  const reportPath = getReportPath(destination, date);

  const [track, setTrack] = useState(null);
  const [audio, setAudio] = useState(null);
  const [photos, setPhotos] = useState(null);
  const [phase, setPhase] = useState({ name: 'loading', forDuration: null });
  const [nextPhoto, setNextPhoto] = useState(undefined);
  const [time, setTime] = useState(null);

  useEffect(
    () => {
      loadTrack(reportPath).then(setTrack);
      const newAudio = setupAudio();
      setAudio(newAudio);
      preparePhotos(newAudio, reportPath, reportJson.landmarks).then(setPhotos);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const callNextPhase = useCallback(() => {
    if (track && photos) {
      nextPhase(audio, reportPath, phase, setPhase, nextPhoto, setNextPhoto, photos);
    }
  }, [audio, reportPath, phase, setPhase, nextPhoto, setNextPhoto, track, photos]);

  useEffect(() => {
    if (phase.forDuration) {
      const timeout = window.setTimeout(() => {
        callNextPhase();
      }, phase.forDuration * 1000);
      return () => {
        window.clearTimeout(timeout);
      };
    }
  }, [phase, callNextPhase]);

  const timeIndependentComponents = useMemo(
    () => {
      if (!track || !photos) {
        return null;
      }
      return (
        <>
          <Curtain closed={phase.name === 'loading' || phase.name === 'intro' || phase.name === 'outro'} />
          {phase.name !== 'loading' && (
            <Logo
              introActive={phase.name === 'intro'}
              outroActive={phase.name === 'outro'}
              onClick={phase.name === 'intro' ? callNextPhase : null}
            />
          )}
          <AnimatedTitle
            reportPath={reportPath}
            title={title + ' ' + formatDate(date)}
            title3d={title3d}
            visible={phase.name === 'loading' || phase.name === 'intro'}
          />
          <Summary visible={phase.name === 'outro'} track={track} />
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
          <Photos
            photos={photos}
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
      )
    },
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
      photos,
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
      {track && <Soundtrack audio={audio} phaseName={phase.name} track={track} time={time} />}
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
