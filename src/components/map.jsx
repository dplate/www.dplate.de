import React from 'react';
import { withPrefix } from 'gatsby';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';
import {
  BillboardGraphics,
  BingMapsImageryProvider,
  BingMapsStyle,
  Cartesian3,
  Cartographic,
  CesiumTerrainProvider,
  ClockRange,
  Color,
  CorridorGraphics,
  createWorldTerrain,
  Credit,
  Ellipsoid,
  EllipsoidGeodesic,
  Entity,
  GeographicTilingScheme,
  HeadingPitchRange,
  HeightReference,
  Ion,
  JulianDate,
  Math as CesiumMath,
  Rectangle,
  SampledPositionProperty,
  SingleTileImageryProvider,
  UrlTemplateImageryProvider,
  VerticalOrigin,
  Viewer,
  WebMapTileServiceImageryProvider
} from 'cesium';
import { Helmet } from 'react-helmet';
import resizeIcon from '../icons/resize.svg';
import closeIcon from '../icons/close.svg';
import mapIcon from '../icons/map.svg';

const CesiumContainer = styled.div`
  position: fixed;
  z-index: 3;
  line-height: 0.7;
  font-size: 8px;
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.75);
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
    display: none;
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
      size: this.props.noUserInterface ? 'fullscreen' : 'icon',
      mapStatus: 'wait',
      allowTeaser: true
    };
    this.hiker = {
      front: null,
      back: null,
      left: null,
      right: null
    };
  }

  componentDidMount() {
    if (this.state.size !== 'icon') {
      this.initCesium();
    }
    if (window.innerWidth < 640) {
      this.setState({
        allowTeaser: false
      });
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
    if (this.props.time !== nextProps.time && this.viewer) {
      this.timeChanged(nextProps.time);
    }
  }

  initCesium() {
    this.loadTrack().then(this.setupMap.bind(this));
  }

  changeSize() {
    let size = 'fullscreen';
    if (this.state.size === 'fullscreen' || (this.state.size === 'icon' && this.state.allowTeaser)) {
      size = 'teaser';
    }
    this.setState({ size });
    this.jumpToTargetTime();
    if (size !== 'icon' && !this.viewer) {
      this.initCesium();
    }
    // noinspection JSUnresolvedVariable
    window.ga && window.ga('send', 'event', 'resizeMap', size);
  }

  close() {
    this.setState({ size: 'icon' });
    // noinspection JSUnresolvedVariable
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
      this.targetTime = JulianDate.fromIso8601(newTime);
      if (this.props.timeShift) {
        JulianDate.addSeconds(this.targetTime, this.props.timeShift, this.targetTime);
      }
      if (JulianDate.compare(this.viewer.clock.startTime, this.targetTime) >= 0) {
        this.targetTime = this.viewer.clock.startTime;
      }
      if (JulianDate.compare(this.targetTime, this.viewer.clock.stopTime) >= 0) {
        this.targetTime = this.viewer.clock.stopTime;
      }
    }
    this.viewer.clock.shouldAnimate = true;
  }

  findOptimalCameraHeight(pinPos) {
    const cameraPos = this.viewer.camera.positionCartographic;
    let optimalHeight = 0;
    for (let distanceFactor = 0.0; distanceFactor < 1.0; distanceFactor += 0.1) {
      const samplePos = new Cartographic(
        pinPos.longitude * distanceFactor + cameraPos.longitude * (1.0 - distanceFactor),
        pinPos.latitude * distanceFactor + cameraPos.latitude * (1.0 - distanceFactor),
        pinPos.height * distanceFactor + cameraPos.height * (1.0 - distanceFactor)
      );
      const terrainHeight = this.viewer.scene.globe.getHeight(samplePos);
      optimalHeight = Math.max(optimalHeight, pinPos.height + (terrainHeight - pinPos.height) / (1.0 - distanceFactor));
    }
    return optimalHeight + 150;
  }

  updateCamera() {
    const terrainHeightUnderCamera = this.viewer.scene.globe.getHeight(this.viewer.camera.positionCartographic);
    const allowedMinimumCameraHeight = terrainHeightUnderCamera + 10;
    const cameraHeight = this.viewer.camera.positionCartographic.height;
    if (!this.viewer.clock.shouldAnimate && (!allowedMinimumCameraHeight || cameraHeight > allowedMinimumCameraHeight))
      return;

    const futureTime = new JulianDate();
    JulianDate.addSeconds(this.viewer.clock.currentTime, 20 * 60, futureTime);
    const secondsAfterEnd = JulianDate.secondsDifference(futureTime, this.viewer.clock.stopTime);
    if (secondsAfterEnd > 0) JulianDate.addSeconds(this.viewer.clock.startTime, secondsAfterEnd, futureTime);

    const pin = this.viewer.entities.getById('pin');
    const currentCart = Cartographic.fromCartesian(pin.position.getValue(this.viewer.clock.currentTime));

    const currentHeight = this.viewer.scene.globe.getHeight(currentCart) || currentCart.height;
    const realCurrentPos = Cartesian3.fromRadians(currentCart.longitude, currentCart.latitude, currentHeight);

    let newHeading;
    if (this.viewer.clock.shouldAnimate) {
      const futureCart = Cartographic.fromCartesian(pin.position.getValue(futureTime));
      const geodesic = new EllipsoidGeodesic(currentCart, futureCart);
      newHeading = geodesic.startHeading;

      const optimalCameraHeight = this.findOptimalCameraHeight(
        new Cartographic(currentCart.longitude, currentCart.latitude, currentHeight)
      );
      if (cameraHeight && optimalCameraHeight) {
        if (this.currentTilt === -15) {
          this.currentTilt = cameraHeight - optimalCameraHeight;
        } else {
          this.currentTilt += (cameraHeight - optimalCameraHeight) * 0.01;
        }
        this.currentTilt = Math.max(this.currentTilt, -90);
        this.currentTilt = Math.min(this.currentTilt, 0);
      }
    } else {
      newHeading = this.viewer.camera.heading;
      this.currentTilt = cameraHeight - allowedMinimumCameraHeight;
    }
    const newPitch = CesiumMath.toRadians(this.currentTilt);
    this.viewer.camera.lookAt(realCurrentPos, new HeadingPitchRange(newHeading, newPitch, 500));
  }

  updateHiker() {
    const pin = this.viewer.entities.getById('pin');

    const currentPos = pin.position.getValue(this.viewer.clock.currentTime);
    if (!currentPos) return;
    const currentCart = Cartographic.fromCartesian(currentPos);

    const futureTime = new JulianDate();
    JulianDate.addSeconds(this.viewer.clock.currentTime, 30, futureTime);
    const futureCart = Cartographic.fromCartesian(pin.position.getValue(futureTime));

    const geodesic = new EllipsoidGeodesic(currentCart, futureCart);
    const hikerHeading = geodesic.startHeading;
    const cameraHeading = this.viewer.camera.heading;
    const viewAngle = (cameraHeading - hikerHeading) % (2 * Math.PI);

    if (viewAngle >= 0.25 * Math.PI && viewAngle < 0.75 * Math.PI) {
      pin.billboard = this.hiker.left;
    } else if (viewAngle >= 0.75 * Math.PI && viewAngle < 1.25 * Math.PI) {
      pin.billboard = this.hiker.front;
    } else if (viewAngle >= 1.25 * Math.PI && viewAngle < 1.75 * Math.PI) {
      pin.billboard = this.hiker.right;
    } else {
      pin.billboard = this.hiker.back;
    }
  }

  updateSpeed() {
    if (!this.targetTime) return;

    const timeDifference = JulianDate.secondsDifference(this.targetTime, this.viewer.clock.currentTime);
    let multiplier = timeDifference / 3;
    multiplier = Math.max(multiplier, -5000);
    multiplier = Math.min(multiplier, 5000);
    this.viewer.clock.multiplier = multiplier;
    if (Math.abs(multiplier) < 20 || Math.abs(timeDifference) <= 10) {
      if (this.viewer.clock.shouldAnimate && this.props.onTimeReached) {
        this.props.onTimeReached();
      }
      this.viewer.clock.shouldAnimate = false;
      if (this.state.mapStatus !== 'free') {
        this.setState({ mapStatus: 'free' });
      }
    } else {
      this.viewer.clock.shouldAnimate = true;
      if (this.state.mapStatus !== 'wait') this.setState({ mapStatus: 'wait' });
    }
  }

  tickChanged() {
    this.updateCamera();
    this.updateSpeed();
    this.updateHiker();
  }

  loadTrack() {
    return fetch(this.props.gpxPath).then((response) => response.text());
  }

  setupMap(gpxRaw) {
    const trackData = this.parseTrackData(gpxRaw);
    this.setupViewer(trackData);
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
    this.viewer.terrainProvider.readyPromise.then(() => {
      this.timeChanged(this.props.time);
      this.jumpToTargetTime();
      this.viewer.clock.shouldAnimate = true;
      this.updateCamera();
      this.viewer.clock.shouldAnimate = false;
    });
  }

  catchInvalidSwissTopoTiles(provider) {
    let randomValidTile = null;
    const originalRequestTileGeometry = provider.requestTileGeometry.bind(provider);
    provider.requestTileGeometry = (x, y, level, request) => {
      const promise = originalRequestTileGeometry(x, y, level, request);
      if (promise) {
        return promise.then((terrainData) => {
          // noinspection JSUnresolvedVariable
          const indexLengths = [
            terrainData._westIndices.length,
            terrainData._southIndices.length,
            terrainData._northIndices.length,
            terrainData._eastIndices.length
          ];
          const brokenIndices = indexLengths.filter((length) => length === 0).length;
          // noinspection JSUnresolvedVariable
          if (brokenIndices > 0 && brokenIndices < 4 && terrainData._minimumHeight <= 150 && randomValidTile) {
            console.warn('Replacing possible invalid terrain tile by random correct tile');
            return randomValidTile;
          } else {
            // noinspection JSUnresolvedVariable
            if (brokenIndices === 0 && terrainData._minimumHeight > 150) {
              randomValidTile = terrainData;
            }
          }
          return terrainData;
        });
      }
    };
    return provider;
  }

  createTerrainProvider() {
    if (this.props.hideSwissTopo) {
      return new createWorldTerrain({
        requestVertexNormals: true
      });
    }
    const provider = new CesiumTerrainProvider({
      url: '//3d.geo.admin.ch/1.0.0/ch.swisstopo.terrain.3d/default/20200520/4326/',
      requestVertexNormals: true
    });
    return this.catchInvalidSwissTopoTiles(provider);
  }

  setupViewer(trackData) {
    Ion.defaultAccessToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2YzA0MGNiZi02N2E1LTQxZGQtYjAzNi1iNDJjYTRjNTU4NzciLCJpZCI6MTgxMSwiaWF0IjoxNTMwMjA0MjIxfQ.o1Sfgaz0-I6_tAgUIO-8RV2kw7nOB-nNupVeHwsGLj0';

    this.viewer = new Viewer('cesiumContainer', {
      terrainProvider: this.createTerrainProvider(),
      baseLayerPicker: false,
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
      showRenderLoopErrors: false,
      imageryProvider: new BingMapsImageryProvider({
        url: 'https://dev.virtualearth.net',
        key: 'AkvC0n8biVNXoCbpiAc4p3g7S9ZHoUWvlpgcJKYQd8FhCA5sn6C8OUmhIR8IEO0X',
        mapStyle: BingMapsStyle.AERIAL
      })
    });
    this.viewer.scene.globe.depthTestAgainstTerrain = true;
    this.viewer.scene.globe.tileCacheSize = 1000;
    this.viewer.scene.globe.cartographicLimitRectangle = this.createGlobeRectangle(trackData.positions);
    this.viewer.scene.globe.enableLighting = true;
    // noinspection JSUnresolvedVariable
    this.viewer.scene._renderError.raiseEvent = (scene, error) => {
      console.error(error);
    };
  }

  parseTrackData(gpxRaw) {
    const trackData = {
      startTime: null,
      stopTime: null,
      sampledPosition: new SampledPositionProperty(),
      positions: []
    };
    const doc = new window.DOMParser().parseFromString(gpxRaw, 'text/xml');
    Array.prototype.slice.call(doc.getElementsByTagName('trkpt')).forEach((trackPoint) => {
      const longitude = parseFloat(trackPoint.getAttribute('lon'));
      const latitude = parseFloat(trackPoint.getAttribute('lat'));
      const position = Cartesian3.fromDegrees(longitude, latitude, 0);
      if (
        trackData.positions.length > 0 &&
        Cartesian3.distance(position, trackData.positions[trackData.positions.length - 1]) < 10
      )
        return;
      const date = JulianDate.fromIso8601(trackPoint.getElementsByTagName('time')[0].firstChild.nodeValue);
      if (!trackData.startTime) trackData.startTime = date;
      trackData.stopTime = date;
      trackData.sampledPosition.addSample(date, position);
      trackData.positions.push(position);
    });
    return trackData;
  }

  addTrack(positions) {
    const corridor = new CorridorGraphics({
      positions,
      material: Color.RED,
      width: 2.0
    });

    this.viewer.entities.add(
      new Entity({
        id: 'track',
        corridor
      })
    );
  }

  loadHiker() {
    ['front', 'back', 'left', 'right'].forEach((orientation) => {
      this.hiker[orientation] = new BillboardGraphics({
        image: '/assets/hiker-' + orientation + '.svg',
        heightReference: HeightReference.CLAMP_TO_GROUND,
        verticalOrigin: VerticalOrigin.BOTTOM,
        depthTestAgainstTerrain: 0
      });
    });
  }

  addPin(sampledPosition) {
    this.loadHiker();
    const pin = new Entity({
      id: 'pin',
      billboard: this.hiker.back,
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
    const snowLayer = layers.addImageryProvider(
      new SingleTileImageryProvider({
        url: '/snow-texture.jpg',
        rectangle: hdRectangle
      })
    );
    snowLayer.alpha = 0.2;
    this.viewer.scene.highDynamicRange = false;
  }

  createHdRectangle(positions) {
    const hdRectangle = Rectangle.fromCartesianArray(positions, Ellipsoid.WGS84);
    hdRectangle.east += 0.0005;
    hdRectangle.west -= 0.0005;
    hdRectangle.north += 0.00025;
    hdRectangle.south -= 0.00025;
    return hdRectangle;
  }

  createGlobeRectangle(positions) {
    const globeRectangle = Rectangle.fromCartesianArray(positions, Ellipsoid.WGS84);
    globeRectangle.east += 0.01;
    globeRectangle.west -= 0.01;
    globeRectangle.north += 0.01;
    globeRectangle.south -= 0.01;
    return globeRectangle;
  }

  addSwissSatellite(hdRectangle) {
    const provider = new UrlTemplateImageryProvider({
      url: '//wmts{s}.geo.admin.ch/1.0.0/ch.swisstopo.swissimage-product/default/current/4326/{z}/{x}/{y}.jpeg',
      subdomains: ['5', '6', '7', '8', '9', '20'],
      minimumLevel: 8,
      maximumLevel: 17,
      tilingScheme: new GeographicTilingScheme({
        numberOfLevelZeroTilesX: 2,
        numberOfLevelZeroTilesY: 1
      }),
      rectangle: hdRectangle,
      credit: new Credit('geodata © swisstopo', true)
    });
    this.viewer.scene.imageryLayers.addImageryProvider(provider);
  }

  addAustriaSatellite(hdRectangle) {
    const provider = new WebMapTileServiceImageryProvider({
      url: '//maps{s}.wien.gv.at/basemap/bmaporthofoto30cm/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.jpeg',
      layer: 'bmaporthofoto30cm',
      style: 'normal',
      tileMatrixSetID: 'google3857',
      subdomains: '1234',
      rectangle: hdRectangle,
      credit: new Credit('<a href="https://www.basemap.at/" target="_blank">Datenquelle: basemap.at</a>', true)
    });
    this.viewer.scene.imageryLayers.addImageryProvider(provider);
  }

  setupClock(startTime, stopTime) {
    this.viewer.clock.startTime = startTime;
    this.viewer.clock.stopTime = stopTime;
    this.viewer.clock.clockRange = ClockRange.CLAMPED;
    this.viewer.clock.currentTime = startTime;
    this.viewer.clock.onTick.addEventListener(this.tickChanged.bind(this));
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
        <Helmet>
          <link href={withPrefix('Cesium/Widgets/widgets.css')} rel="stylesheet" type="text/css" />
        </Helmet>
        <CesiumContainer
          id="cesiumContainer"
          className={this.state.size + ' ' + this.state.mapStatus}
          onClick={this.props.onClick}
        />
        {!this.props.noUserInterface && (
          <MenuBar className={this.state.size}>
            <ResizeIcon onClick={this.changeSize.bind(this)} src={resizeIcon} />
            <CloseIcon onClick={this.close.bind(this)} src={closeIcon} />
          </MenuBar>
        )}
        {!this.props.noUserInterface && (
          <MapButton onClick={this.changeSize.bind(this)} className={this.state.size}>
            {this.renderMapButton()}
          </MapButton>
        )}
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
  onClick: PropTypes.func,
  noUserInterface: PropTypes.bool,
  onTimeReached: PropTypes.func
};

export default Map;
