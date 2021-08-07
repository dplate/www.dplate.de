import React from 'react';
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

class MapButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      size: 'icon',
      allowTeaser: true
    };
  }

  componentDidMount() {
    if (window.innerWidth < 640) {
      this.setState({
        allowTeaser: false
      });
    }
  }

  changeSize() {
    let size = 'fullscreen';
    if (this.state.size === 'fullscreen' || (this.state.size === 'icon' && this.state.allowTeaser)) {
      size = 'teaser';
    }
    this.setState({ size });
    // noinspection JSUnresolvedVariable
    window.ga && window.ga('send', 'event', 'resizeMap', size);
  }

  close() {
    this.setState({ size: 'icon' });
    // noinspection JSUnresolvedVariable
    window.ga && window.ga('send', 'event', 'closeMap', 'click');
  }

  renderMapButton() {
    if (this.props.time && this.props.time !== 'start' && this.props.time !== 'end') {
      const timeParts = this.props.time.split('T')[1].split(':');
      const formattedTime = `${timeParts[0]}:${timeParts[1]}`;
      return [
        <TimeBar key="timeBar" className={this.state.size}>
          {formattedTime}
        </TimeBar>,
        <MapIcon key="mapIcon" src={mapIcon} />,
        <MapInfo key="mapInfo">Karte</MapInfo>
      ];
    }
  }

  render() {
    return (
      <div>
        <MenuBar className={this.state.size}>
          <ResizeIcon onClick={this.changeSize.bind(this)} src={resizeIcon} />
          <CloseIcon onClick={this.close.bind(this)} src={closeIcon} />
        </MenuBar>
        {this.state.size !== 'icon' && (
          <Map {...this.props.mapProps} time={this.props.time} size={this.state.size} />
        )}
        <Button onClick={this.changeSize.bind(this)} className={this.state.size}>
          {this.renderMapButton()}
        </Button>
      </div>
    );
  }
}

MapButton.propTypes = {
  time: PropTypes.string.isRequired,
  mapProps: PropTypes.object.isRequired
};

export default MapButton;
