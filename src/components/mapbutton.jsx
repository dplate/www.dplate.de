import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';
import resizeIcon from '../icons/resize.svg';
import closeIcon from '../icons/close.svg';
import mapIcon from '../icons/map.svg';
import Map from './map.jsx';

const MenuBar = styled.div`
  position: fixed;
  z-index: 4;
  background-color: rgba(0, 0, 0, 0.15);
  height: 35px;

  &.teaser {
    width: 30vw;
    right: 5px;
    bottom: calc(30vh - 30px);
  }

  &.fullscreen {
    left: 0;
    right: 0;
    top: 0;
  }

  &.icon {
    display: none;
  }
`;

const Icon = styled.img`
  position: absolute;
  cursor: pointer;
  opacity: 0.5;
  height: 24px;
  width: 24px;
  top: 5px;

  :hover {
    opacity: 1;
  }
`;
const ResizeIcon = styled(Icon)`
  transform: scale(-1, 1);
  left: 5px;
`;
const CloseIcon = styled(Icon)`
  right: 5px;
`;


const bounceIn = keyframes`
  0% {
    bottom: -50px;
    opacity: 1.0;
  }
  25% {
    bottom: 5px;
  }
  75% {
    bottom: 5px;
    opacity: 1.0;
  }
  100% {
    bottom: -20px;
    opacity: 0.5;
  }
`;
const Button = styled.span`
  position: fixed;
  cursor: pointer;
  right: 10px;
  bottom: -20px;
  opacity: 0.5;
  text-align: right;

  :hover {
    opacity: 1.0;
  }

  :not(:empty) {
    animation: ${bounceIn} 5s ease;
  }

  &.teaser {
    display: none;
  }

  &.fullscreen {
    display: none;
  }
}
`;
const TimeBar = styled.div`
  text-align: right;
`;
const MapIcon = styled.img`
  height: 35px;
  width: 35px;
  margin-right: 2px;
`;
const MapInfo = styled.div`
  text-align: right;
`;

const changeSize = (size, setSize, allowTeaser) => {
  let newSize = 'fullscreen';
  if (size === 'fullscreen' || (size === 'icon' && allowTeaser)) {
    newSize = 'teaser';
  }
  setSize(newSize)
  // noinspection JSUnresolvedVariable
  window.ga && window.ga('send', 'event', 'resizeMap', newSize);
};

const close = (setSize) => {
  setSize('icon');
  // noinspection JSUnresolvedVariable
  window.ga && window.ga('send', 'event', 'closeMap', 'click');
}

const renderButton = (time, size) => {
  if (time && time !== 'start' && time !== 'end') {
    const timeParts = time.split('T')[1].split(':');
    const formattedTime = `${timeParts[0]}:${timeParts[1]}`;
    return [
      <TimeBar key="timeBar" className={size}>
        {formattedTime}
      </TimeBar>,
      <MapIcon key="mapIcon" src={mapIcon} />,
      <MapInfo key="mapInfo">Karte</MapInfo>
    ];
  }
};

const MapButton = ({time, mapProps}) => {
  const [size, setSize] = useState('icon');
  const [allowTeaser, setAllowTeaser] = useState(true);
  useEffect(() => setAllowTeaser(window.innerWidth >= 640), []);

  const changeSizePrepared = () => changeSize(size, setSize, allowTeaser);

  return (
    <div>
      <MenuBar className={size}>
        <ResizeIcon onClick={changeSizePrepared} src={resizeIcon} />
        <CloseIcon onClick={() => close(setSize)} src={closeIcon} />
      </MenuBar>
      {size !== 'icon' && (
        <Map {...mapProps} time={time} size={size} />
      )}
      <Button onClick={changeSizePrepared} className={size}>
        {renderButton(time, size)}
      </Button>
    </div>
  );
};

MapButton.propTypes = {
  time: PropTypes.string.isRequired,
  mapProps: PropTypes.object.isRequired
};

export default MapButton;
