import React, { useEffect, useState, Suspense } from 'react';
import PropTypes from 'prop-types';
import styles from './mapbutton.module.css';
import resizeIcon from '../icons/resize.svg?url';
import closeIcon from '../icons/close.svg?url';
import mapIcon from '../icons/map.svg?url';
import loadTrack from '../utils/loadTrack';
const Map = React.lazy(() => import('./map.jsx'));

const changeSize = (size, setSize, allowTeaser) => {
  let newSize = 'fullscreen';
  if (size === 'fullscreen' || (size === 'icon' && allowTeaser)) {
    newSize = 'teaser';
  }
  setSize(newSize);
  // noinspection JSUnresolvedVariable
  window.gtag('event', 'resizeMap', { newSize });
};

const close = (setSize) => {
  setSize('icon');
  // noinspection JSUnresolvedVariable
  window.gtag('event', 'closeMap');
};

const renderButton = (time, size) => {
  if (time && time !== 'start' && time !== 'end') {
    const timeParts = time.split('T')[1].split(':');
    const formattedTime = `${timeParts[0]}:${timeParts[1]}`;
    return [
      <div key="timeBar" className={`${styles.timeBar} ${size}`}>
        {formattedTime}
      </div>,
      <img key="mapIcon" className={styles.mapIcon} src={mapIcon} />,
      <div key="mapInfo" className={styles.mapInfo}>Karte</div>
    ];
  }
};

const MapButton = ({ time, reportPath, mapProps }) => {
  const [track, setTrack] = useState(null);
  const [size, setSize] = useState('icon');
  const [allowTeaser, setAllowTeaser] = useState(true);
  useEffect(() => setAllowTeaser(window.innerWidth >= 640), []);
  useEffect(() => {
    if (size !== 'icon' && !track) {
      loadTrack(reportPath).then(setTrack);
    }
  }, [reportPath, track, size]);

  const changeSizePrepared = () => changeSize(size, setSize, allowTeaser);

  return (
    <div>
      <div className={`${styles.menuBar} ${size}`}>
        <img className={styles.resizeIcon} onClick={changeSizePrepared} src={resizeIcon} />
        <img className={styles.closeIcon} onClick={() => close(setSize)} src={closeIcon} />
      </div>
      {size !== 'icon' && (
        <Suspense fallback={'loading'}>
          {track && <Map {...mapProps} track={track} wishTime={time} size={size} />}
        </Suspense>
      )}
      <span className={`${styles.button} ${size}`} onClick={changeSizePrepared}>
        {renderButton(time, size)}
      </span>
    </div>
  );
};

MapButton.propTypes = {
  time: PropTypes.string.isRequired,
  reportPath: PropTypes.string.isRequired,
  mapProps: PropTypes.object.isRequired
};

export default MapButton;
