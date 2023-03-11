import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const SummaryContainer = styled.div.attrs(({ opacity }) => ({
  style: { opacity }
}))`
  position: absolute;
  z-index: 6;
  font-size: 2vw;
  color: #A0A0A0;
  line-height: 1.1;
  transition: opacity 5s ease-in-out;
`;

const Duration = styled.div`
  position: fixed;
  left: 5vw;
  top: 5vh;
`;

const Distance = styled.div`
  position: fixed;
  right: 5vw;
  top: 5vh;
  text-align: right;
`;

const Height = styled.div`
  position: fixed;
  left: 5vw;
  bottom: 5vh;
`;

const Time = styled.div`
  position: fixed;
  right: 5vw;
  bottom: 5vh;
  text-align: right;
`;

const ValueLeft = styled.span`
  display: inline-block;
  width: 14vw;
  padding-right: 2vw;
  font-size: 4vw;
  color: #FFFFFF;
  text-align: right;
`; 

const ValueRight = styled.span`
  display: inline-block;
  width: 12vw;
  font-size: 4vw;
  color: #FFFFFF;
  text-align: right;
`; 

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
    <SummaryContainer opacity={visible ? 1 : 0}>
      <Duration>
        <ValueLeft>{formatDuration(track.maxWalkDuration)}</ValueLeft> Gehzeit<br />
      </Duration>
      <Distance>
        Gehstrecke <ValueRight>{formatDistance(track.maxWalkDistance)}</ValueRight><br />
      </Distance>
      <Height>
        <ValueLeft>{formatHeight(track.maxWalkUp)}</ValueLeft> Aufstieg<br />
        <ValueLeft>{formatHeight(track.maxWalkDown)}</ValueLeft> Abstieg<br />
      </Height>
      <Time>
        Startzeit <ValueRight>{formatTime(track.startTime)}</ValueRight><br />
        Zielzeit <ValueRight>{formatTime(track.stopTime)}</ValueRight>
      </Time>  
    </SummaryContainer>    
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
  }),
};

export default Summary;
