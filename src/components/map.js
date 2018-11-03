import React from 'react'
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components'
import Script from 'react-load-script'
import resizeIcon from '../icons/resize.svg'
import closeIcon from '../icons/close.svg'
import mapIcon from '../icons/map.svg'

const CesiumContainer = styled.div`
  position: fixed;
  z-index: 3;
  line-height: 0.7;
  font-size: 8px;
  box-shadow: 0 0 20px 0 rgba(0,0,0,0.75);
  cursor: all-scroll;
  .cesium-credit-logoContainer img {
    max-width: 5vw;
  }
  .cesium-viewer-bottom {
    bottom: 3px !important;
  }
  &.wait {
    cursor: wait;
  }
  &.teaser {
    right: 5px;
    bottom: 5px;
    height: 30vh;
    width: 30vw;
  }
  &.fullscreen {
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    .cesium-viewer-bottom {
      right: 40px;
    }
  }
  &.icon {
    display: none
  }
`;

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
    left: 0px;
    right: 0px;
    top: 0px;
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
    opacity: 1.0;
  }
`;
const ResizeIcon = Icon.extend`
  transform: scale(-1, 1);
  left: 5px;
`;
const CloseIcon = Icon.extend`
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
const MapButton = styled.span`
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

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.currentTilt = -15;
    this.targetTime = null;
    this.state = {
      size: 'icon',
      mapStatus: 'wait',
      allowTeaser: true
    };
  }

  componentDidMount() {
    if (window.innerWidth < 640) {
      this.setState({
        allowTeaser: false
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.time !== nextProps.time && this.Cesium) {
      this.timeChanged(nextProps.time);
    }
  }

  initCesium() {
    window.CESIUM_BASE_URL = __PATH_PREFIX__ + '/Cesium';
    this.Cesium = window.Cesium;
    this.loadTrack().then(this.setupMap.bind(this));
  }

  changeSize() {
    let size = 'fullscreen';
    if (this.state.size === 'fullscreen' ||
      (this.state.size === 'icon' && this.state.allowTeaser)) {
      size = 'teaser';
    }
    this.setState({ size });
    this.jumpToTargetTime();
    window.ga && window.ga('send', 'event', 'resizeMap', size);
  }

  close() {
    this.setState({ size: 'icon' });
    window.ga && window.ga('send', 'event', 'closeMap', 'click');
  }

  jumpToTargetTime() {
    if (this.targetTime) {
      this.viewer.clock.currentTime = this.targetTime;
    }
  }

  timeChanged(newTime) {
    if (newTime === 'start') {
      this.targetTime = this.viewer.clock.startTime;
    } else if (newTime === 'end') {
      this.targetTime = this.viewer.clock.stopTime;
    } else {
      this.targetTime = this.Cesium.JulianDate.fromIso8601(newTime);
      if (this.props.timeShift) {
        this.Cesium.JulianDate.addSeconds(this.targetTime, this.props.timeShift, this.targetTime);
      }
    }
  }

  findOptimalCameraHeight(pinPos) {
    const cameraPos = this.viewer.camera.positionCartographic;
    let optimalHeight = 0;
    for (let distanceFactor = 0.0; distanceFactor < 1.0; distanceFactor += 0.1) {
      const samplePos = new Cesium.Cartographic(
        pinPos.longitude * distanceFactor + cameraPos.longitude * (1.0 - distanceFactor),
        pinPos.latitude * distanceFactor + cameraPos.latitude * (1.0 - distanceFactor),
        pinPos.height * distanceFactor + cameraPos.height * (1.0 - distanceFactor)
      );
      const terrainHeight = this.viewer.scene.globe.getHeight(samplePos);
      optimalHeight = Math.max(optimalHeight, pinPos.height + (terrainHeight -  pinPos.height) / (1.0 - distanceFactor));
    }
    return optimalHeight + 150;
  }

  updateCamera() {
    const terrainHeightUnderCamera = this.viewer.scene.globe.getHeight(this.viewer.camera.positionCartographic);
    const cameraHeight = this.viewer.camera.positionCartographic.height;
    if (!this.viewer.clock.shouldAnimate && cameraHeight > terrainHeightUnderCamera) return;

    const futureTime = new this.Cesium.JulianDate();
    this.Cesium.JulianDate.addSeconds(this.viewer.clock.currentTime, 20 * 60, futureTime);
    const secondsAfterEnd = this.Cesium.JulianDate.secondsDifference(futureTime, this.viewer.clock.stopTime);
    if (secondsAfterEnd > 0) this.Cesium.JulianDate.addSeconds(this.viewer.clock.startTime, secondsAfterEnd, futureTime);

    const pin = this.viewer.entities.getById('pin');
    const currentCart = this.Cesium.Cartographic.fromCartesian(pin.position.getValue(this.viewer.clock.currentTime));
    const futureCart = this.Cesium.Cartographic.fromCartesian(pin.position.getValue(futureTime));
    const geodesic = new this.Cesium.EllipsoidGeodesic(currentCart, futureCart);

    const currentHeight = this.viewer.scene.globe.getHeight(currentCart) || currentCart.height;
    const realCurrentPos = this.Cesium.Cartesian3.fromRadians(currentCart.longitude, currentCart.latitude, currentHeight);

    const optimalCameraHeight = this.findOptimalCameraHeight(new Cesium.Cartographic(currentCart.longitude, currentCart.latitude, currentHeight));
    if (cameraHeight && optimalCameraHeight) {
      this.currentTilt += (cameraHeight - optimalCameraHeight) * 0.01;
      this.currentTilt = Math.max(this.currentTilt, -90);
      this.currentTilt = Math.min(this.currentTilt, 0);
    }
    this.viewer.camera.lookAt(realCurrentPos, new this.Cesium.HeadingPitchRange(geodesic.startHeading, this.Cesium.Math.toRadians(this.currentTilt), 500));
  }

  updateSpeed() {
    if (!this.targetTime) return;

    const timeDifference = this.Cesium.JulianDate.secondsDifference(this.targetTime, this.viewer.clock.currentTime);
    let multiplier = timeDifference/3;
    multiplier = Math.max(multiplier, -5000);
    multiplier = Math.min(multiplier, 5000);
    this.viewer.clock.multiplier = multiplier;
    if (Math.abs(multiplier) < 20) {
      this.viewer.clock.shouldAnimate = false;
      if (this.state.mapStatus !== 'free') this.setState({ mapStatus: 'free' });
    } else {
      this.viewer.clock.shouldAnimate = true;
      if (this.state.mapStatus !== 'wait') this.setState({ mapStatus: 'wait' });
    }
  }

  tickChanged() {
    this.updateCamera();
    this.updateSpeed();
  }

  loadTrack() {
    return fetch(this.props.gpxPath).then(response => response.text());
  }

  setupMap(gpxRaw) {
    this.setupViewer();
    const trackData = this.parseTrackData(gpxRaw);
    this.addTrack(trackData.positions);
    this.addPin(trackData.sampledPosition);
    const hdRectangle = this.createHdRectangle(trackData.positions);
    if (this.props.detailMap === 'swiss') {
      this.addSwissSatellite(hdRectangle);
    }
    if (this.props.detailMap === 'austria') {
      this.addAustriaSatellite(hdRectangle);
    }
    if (this.props.winter) {
      this.turnToWinter(hdRectangle);
    }
    this.setupClock(trackData.startTime, trackData.stopTime);
    this.timeChanged(this.props.time);
  }

  createTerrainProvider() {
    if (this.props.hideSwissTopo) {
      return new this.Cesium.createWorldTerrain({
        requestVertexNormals: true
      })
    }
    return new this.Cesium.CesiumTerrainProvider({
      url : '//3d.geo.admin.ch/1.0.0/ch.swisstopo.terrain.3d/default/20160115/4326/',
      requestVertexNormals: true
    })
  }

  setupViewer() {
    this.Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2YzA0MGNiZi02N2E1LTQxZGQtYjAzNi1iNDJjYTRjNTU4NzciLCJpZCI6MTgxMSwiaWF0IjoxNTMwMjA0MjIxfQ.o1Sfgaz0-I6_tAgUIO-8RV2kw7nOB-nNupVeHwsGLj0';

    this.viewer = new this.Cesium.Viewer('cesiumContainer', {
      terrainProvider : this.createTerrainProvider(),
      baseLayerPicker : false,
      geocoder: false,
      animation: false,
      fullscreenButton: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      scene3DOnly: true,
      imageryProvider : new this.Cesium.BingMapsImageryProvider({
        url : 'https://dev.virtualearth.net',
        key : 'AkvC0n8biVNXoCbpiAc4p3g7S9ZHoUWvlpgcJKYQd8FhCA5sn6C8OUmhIR8IEO0X',
        mapStyle : this.Cesium.BingMapsStyle.AERIAL,
      })
    });
    this.viewer.scene.globe.depthTestAgainstTerrain = true;
    this.viewer.scene.globe.enableLighting = true;
  }

  parseTrackData(gpxRaw) {
    const trackData = {
      startTime: null,
      stopTime: null,
      sampledPosition: new this.Cesium.SampledPositionProperty(),
      positions: []
    };
    const doc = (new window.DOMParser()).parseFromString(gpxRaw, 'text/xml');
    Array.prototype.slice.call(doc.getElementsByTagName('trkpt')).forEach((trackPoint) => {
      const longitude = parseFloat(trackPoint.getAttribute('lon'));
      const latitude = parseFloat(trackPoint.getAttribute('lat'));
      const position = this.Cesium.Cartesian3.fromDegrees(longitude, latitude, 0);
      if (trackData.positions.length > 0 && this.Cesium.Cartesian3.distance(position, trackData.positions[trackData.positions.length - 1]) < 10) return;
      const date = this.Cesium.JulianDate.fromIso8601(trackPoint.getElementsByTagName('time')[0].firstChild.nodeValue);
      if (!trackData.startTime) trackData.startTime = date;
      trackData.stopTime = date;
      trackData.sampledPosition.addSample(date, position);
      trackData.positions.push(position);
    });
    return trackData;
  }

  addTrack(positions) {
    const corridor = new this.Cesium.CorridorGraphics({
      positions,
      material: this.Cesium.Color.RED,
      width: 2.0
    });

    this.viewer.entities.add(new this.Cesium.Entity({
      id : 'track',
      corridor
    }));
  }

  addPin(sampledPosition) {
    const billboard = new this.Cesium.BillboardGraphics({
      image: __PATH_PREFIX__ + '/Cesium/Assets/Textures/pin.svg',
      heightReference: this.Cesium.HeightReference.CLAMP_TO_GROUND,
      verticalOrigin: this.Cesium.VerticalOrigin.BOTTOM,
      depthTestAgainstTerrain: 0
    });
    const pin = new this.Cesium.Entity({
      id : 'pin',
      billboard,
      position: sampledPosition
    });
    this.viewer.entities.add(pin);
  }

  turnToWinter(hdRectangle) {
    const layers = this.viewer.scene.imageryLayers;
    for (let i = 0; i < layers.length; i++) {
      const layer = layers.get(i);
      layer.contrast = 2.5;
      layer.saturation = 0.2;
      layer.brightness = 1.5;
    }
    const snowLayer = layers.addImageryProvider(new Cesium.SingleTileImageryProvider({
      url : __PATH_PREFIX__ + '/snow-texture.jpg',
      rectangle : hdRectangle
    }));
    snowLayer.alpha = 0.2;
  }

  createHdRectangle(positions) {
    const hdRectangle = this.Cesium.Rectangle.fromCartesianArray(positions, this.Cesium.Ellipsoid.WGS84);
    hdRectangle.east += 0.0005; hdRectangle.west -= 0.0005; hdRectangle.north += 0.00025; hdRectangle.south -= 0.00025;
    return hdRectangle;
  }

  addSwissSatellite(hdRectangle) {
    const provider = new this.Cesium.UrlTemplateImageryProvider({
      url: '//wmts{s}.geo.admin.ch/1.0.0/ch.swisstopo.swissimage-product/default/current/4326/{z}/{x}/{y}.jpeg',
      subdomains: ['5', '6', '7', '8', '9', '20'],
      minimumLevel: 8,
      maximumLevel: 17,
      tilingScheme: new this.Cesium.GeographicTilingScheme({
        numberOfLevelZeroTilesX: 2,
        numberOfLevelZeroTilesY: 1
      }),
      rectangle: hdRectangle,
      credit: new Cesium.Credit('geodata © swisstopo', true)
    });
    this.viewer.scene.imageryLayers.addImageryProvider(provider);
  }

  addAustriaSatellite(hdRectangle) {
    const provider = new this.Cesium.WebMapTileServiceImageryProvider({
      url: '//maps{s}.wien.gv.at/basemap/bmaporthofoto30cm/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.jpeg',
      layer: 'bmaporthofoto30cm',
      style: 'normal',
      tileMatrixSetID: 'google3857',
      subdomains: '1234',
      rectangle: hdRectangle,
      credit: new Cesium.Credit('<a href="https://www.basemap.at/" target="_blank">Datenquelle: basemap.at</a>', true)
    });
    this.viewer.scene.imageryLayers.addImageryProvider(provider);
  }

  setupClock(startTime, stopTime) {
    this.viewer.clock.startTime = startTime;
    this.viewer.clock.stopTime = stopTime;
    this.viewer.clock.clockRange = this.Cesium.ClockRange.CLAMPED;
    this.viewer.clock.currentTime = startTime;
    this.viewer.clock.onTick.addEventListener(this.tickChanged.bind(this));
  }

  renderMapButton() {
    if (this.props.time && this.props.time !== 'start' && this.props.time !== 'end') {
      const timeParts = this.props.time.split('T')[1].split(':');
      const formattedTime = `${timeParts[0]}:${timeParts[1]}`;
      return [
          <TimeBar key="timeBar" className={this.state.size}>{formattedTime}</TimeBar>,
          <MapIcon key="mapIcon" src={mapIcon} />,
          <MapInfo key="mapInfo">Karte</MapInfo>
      ];
    }
  }

  render() {
    const shouldInjectCesium = (!this.Cesium && this.state.size !== 'icon') || this.Cesium;
    return (
      <div>
        { shouldInjectCesium && <link rel="stylesheet" href={__PATH_PREFIX__ + '/Cesium/Widgets/widgets.css'} media="screen" type="text/css" /> }
        <CesiumContainer id="cesiumContainer" className={this.state.size + ' ' + this.state.mapStatus} onClick={this.props.onClick} />
        <MenuBar className={this.state.size}>
          <ResizeIcon onClick={this.changeSize.bind(this)} src={resizeIcon} />
          <CloseIcon onClick={this.close.bind(this)} src={closeIcon} />
        </MenuBar>
        <MapButton onClick={this.changeSize.bind(this)} className={this.state.size}>{ this.renderMapButton() }</MapButton>
        { shouldInjectCesium && <Script url={__PATH_PREFIX__ + '/Cesium/Cesium.js'} onLoad={this.initCesium.bind(this)} /> }
      </div>
    );
  }
}

Map.propTypes = {
  gpxPath: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
  timeShift: PropTypes.number,
  detailMap: PropTypes.string,
  hideSwissTopo: PropTypes.bool,
  winter: PropTypes.bool,
  onClick: PropTypes.func
};

export default Map;

