import React from 'react';
import PropTypes from 'prop-types';
import styles from './Summary.module.css';


const formatDuration = (duration) => {
  const minutes = duration / (60 * 1000);
  return `${Math.floor(minutes / 60)}h ${Math.floor(Math.floor(minutes % 60) / 10) * 10}m`;
};

const formatDistance = (distance) => {
  return `${Math.round(distance / 1000)} km`;
};

const formatHeight = (height) => {
  return `${Math.round(height / 10) * 10} m`;
};

const germanTimeFormat = new Intl.DateTimeFormat('de-DE', {
  timeStyle: 'short',
  timeZone: 'Europe/Zurich'
});

const formatTime = (time) => {
  return `${germanTimeFormat.format(new Date(time))}`;
};

const Summary = ({ visible, track }) => {
  if (!track) {
    return null;
  }
  return (
    <div className={styles.summaryContainer} style={{ opacity: visible ? 1 : 0 }}>
      <div className={styles.duration}>
        <span className={styles.valueLeft}>{formatDuration(track.maxWalkDuration)}</span> Gehzeit
        <br />
      </div>
      <div className={styles.distance}>
        Gehstrecke <span className={styles.valueRight}>{formatDistance(track.maxWalkDistance)}</span>
        <br />
      </div>
      <div className={styles.height}>
        <span className={styles.valueLeft}>{formatHeight(track.maxWalkUp)}</span> Aufstieg
        <br />
        <span className={styles.valueLeft}>{formatHeight(track.maxWalkDown)}</span> Abstieg
        <br />
      </div>
      <div className={styles.time}>
        Startzeit <span className={styles.valueRight}>{formatTime(track.startTime)}</span>
        <br />
        Zielzeit <span className={styles.valueRight}>{formatTime(track.stopTime)}</span>
      </div>
    </div>
  );
};

Summary.propTypes = {
  visible: PropTypes.bool.isRequired,
  track: PropTypes.shape({
    startTime: PropTypes.object.isRequired,
    stopTime: PropTypes.object.isRequired,
    startTimestamp: PropTypes.number.isRequired,
    stopTimestamp: PropTypes.number.isRequired,
    maxWalkDuration: PropTypes.number.isRequired,
    maxDistance: PropTypes.number.isRequired,
    maxWalkDistance: PropTypes.number.isRequired,
    maxWalkUp: PropTypes.number.isRequired,
    maxWalkDown: PropTypes.number.isRequired
  })
};

export default Summary;
