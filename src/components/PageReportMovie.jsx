import React, { Suspense, useState, useEffect, useMemo, useCallback } from 'react';
import styles from './PageReportMovie.module.css';
import formatDate from '../utils/formatDate.js';
import AnimatedTitle from './animatedtitle.jsx';
import Photos from './reportMovie/Photos.jsx';
import Logo from './reportMovie/Logo.jsx';
import Curtain from './reportMovie/Curtain.jsx';
import HeightGraph from './reportMovie/HeightGraph.jsx';
import YoutubeMetadata from './reportMovie/YoutubeMetadata.jsx';
import Soundtrack from './reportMovie/Soundtrack.jsx';
import loadTrack from '../utils/loadTrack.js';
import Summary from './reportMovie/Summary.jsx';
import setupAudio from '../utils/setupAudio';
import getReportPath from '../utils/getReportPath.js';
const Map = React.lazy(() => import('./map.jsx'));

const minPhotoDuration = 5;

const loadVoiceOver = async (audio, reportPath, name) => {
  const path = `/voiceOver${reportPath}/${name}.ogg`;
  return await audio.load(path);
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
        voiceOver: photoIndex === 0 ? voiceOver : null,
        duration: Math.max(minPhotoDuration, voiceOver ? voiceOver.getDuration() / validPhotos.length : 0)
      }));
      photos.push(...enhancedPhotos);
    }
  }
  return photos;
};

const ReportMovie = ({ data: { reportJson, destinationJson } }) => {
  const { destination, date, timeShift, detailMap, hideSwissTopo, type, title, shortTitle, title3d } = reportJson;
  const { name: destinationName } = destinationJson;
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

  const timeIndependentComponents = useMemo(() => {
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
            flyInSeconds={phase.name === 'introScroll' ? phase.forDuration : null}
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
          destinationName={destinationName}
          title={title}
          shortTitle={shortTitle}
          reportPath={reportPath}
          phaseName={phase.name}
          nextPhoto={nextPhoto}
        />
      </>
    );
  }, [
    date,
    detailMap,
    hideSwissTopo,
    shortTitle,
    timeShift,
    destinationName,
    title,
    title3d,
    type,
    track,
    photos,
    reportPath,
    phase,
    nextPhoto,
    callNextPhase
  ]);

  return (
    <div id="movie" className={styles.movie}>
      {timeIndependentComponents}
      {track && <HeightGraph visible={phase.name === 'map'} track={track} time={time} />}
      {track && <Soundtrack audio={audio} phaseName={phase.name} track={track} time={time} />}
    </div>
  );
};

export default ReportMovie;
