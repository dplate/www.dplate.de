import React from 'react'
import PropTypes from 'prop-types';
import styled from 'styled-components'
import Script from 'react-load-script'
import resizeIcon from '../icons/resize.svg'
import mapIcon from '../icons/map.svg'

const CesiumContainer = styled.div`
  position: fixed;
  line-height: 0.7;
  font-size: 8px;
  box-shadow: 0 0 20px 0 rgba(0,0,0,0.75);
  cursor: all-scroll;
  .cesium-credit-image img {
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
const ResizeIcon = styled.img`
  position: fixed;
  cursor: pointer;
  transform: scale(-1, 1);
  opacity: 0.5;
  filter: invert(100%);
  height: 24px;
  width: 24px;
  box-shadow: 0 0 5px 0 rgba(255,255,255,1);
  :hover {
    opacity: 1.0;
  }
  &.teaser {
    right:  calc(30vw - 25px);
    bottom: calc(30vh - 25px);
  }
  &.fullscreen {
    right: 5px;
    bottom: 5px;
  }
  &.icon {
    display: none;
  }
`;

const MapIcon = styled.img`
  position: fixed;
  cursor: pointer;
  height: 35px;
  width: 35px;
  right: 5px;
  bottom: 5px;
  opacity: 0.5;
  :hover {
    opacity: 1.0;
  }
  &.teaser {
    display: none;
  }
  &.fullscreen {
    display: none;
  }
`;

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.currentTilt = -15;
    this.targetTime = null;
    this.state = {
      size: 'teaser',
      mapStatus: 'wait',
      allowTeaser: true
    };
  }

  componentDidMount() {
    if (window.innerWidth < 1200) {
      this.setState({
        size: 'icon',
        allowTeaser: window.innerWidth >= 640
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
    if (this.state.size === 'teaser') {
      this.setState({ size: 'fullscreen' });
    } else if (this.state.size === 'fullscreen') {
      this.setState({ size: 'icon' });
    } else if (this.state.allowTeaser) {
      this.setState({ size: 'teaser' });
    } else {
      this.setState({ size: 'fullscreen' });
    }
  }

  timeChanged(newTime) {
    this.targetTime = this.Cesium.JulianDate.fromIso8601(newTime);
  }

  updateCamera() {
    if (!this.viewer.clock.shouldAnimate) return;

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

    const terrainHeightUnderCamera = this.viewer.scene.globe.getHeight(this.viewer.camera.positionCartographic);
    if (terrainHeightUnderCamera) {
      this.currentTilt += (this.viewer.camera.positionCartographic.height - (200 + terrainHeightUnderCamera)) * 0.01;
      this.currentTilt = Math.max(this.currentTilt, -90);
      this.currentTilt = Math.min(this.currentTilt, 0);
    }
    this.viewer.camera.lookAt(realCurrentPos, new this.Cesium.HeadingPitchRange(geodesic.startHeading, this.Cesium.Math.toRadians(this.currentTilt), 500));
  }

  updateSpeed() {
    if (!this.targetTime) return;

    const timeDifference = this.Cesium.JulianDate.secondsDifference(this.targetTime, this.viewer.clock.currentTime);
    let multiplier = timeDifference;
    multiplier = Math.max(multiplier, -10000);
    multiplier = Math.min(multiplier, 10000);
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
    this.addSwissSatellite(trackData.positions);
    this.setupClock(trackData.startTime, trackData.stopTime);
    this.timeChanged(this.props.time);
  }

  setupViewer() {
    this.viewer = new this.Cesium.Viewer('cesiumContainer', {
      terrainProvider : new this.Cesium.CesiumTerrainProvider({
        url : '//3d.geo.admin.ch/1.0.0/ch.swisstopo.terrain.3d/default/20160115/4326/',
        requestVertexNormals: true
      }),
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
        mapStyle : this.Cesium.BingMapsStyle.AERIAL
      })
    });

    this.viewer.scene.globe.enableLighting = true;
    this.viewer.scene.globe.depthTestAgainstTerrain = true;
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

  addSwissSatellite(positions) {
    const hdRectangle = this.Cesium.Rectangle.fromCartesianArray(positions, this.Cesium.Ellipsoid.WGS84);
    hdRectangle.east += 0.001; hdRectangle.west -= 0.001; hdRectangle.north += 0.0005; hdRectangle.south -= 0.0005;
    const provider = new this.Cesium.UrlTemplateImageryProvider({
      url: "//wmts{s}.geo.admin.ch/1.0.0/ch.swisstopo.swissimage-product/default/current/4326/{z}/{y}/{x}.jpeg",
      subdomains: '56789',
      minimumLevel: 8,
      maximumLevel: 17,
      tilingScheme: new this.Cesium.GeographicTilingScheme({
        numberOfLevelZeroTilesX: 2,
        numberOfLevelZeroTilesY: 1
      }),
      rectangle: hdRectangle,
      credit: 'geodata © swisstopo'
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

  render() {
    return (
      <div>
        <link rel="stylesheet" href={__PATH_PREFIX__ + '/Cesium/Widgets/widgets.css'} media="screen" type="text/css" />
        <CesiumContainer id="cesiumContainer" className={this.state.size + ' ' + this.state.mapStatus} />
        <ResizeIcon onClick={this.changeSize.bind(this)} id="resizeIcon" className={this.state.size} src={resizeIcon} />
        <MapIcon onClick={this.changeSize.bind(this)} id="mapIcon" className={this.state.size} src={mapIcon} />
        <Script url={__PATH_PREFIX__ + '/Cesium/Cesium.js'} onLoad={this.initCesium.bind(this)} />
      </div>
    );
  }
}

Map.propTypes = {
  gpxPath: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired
};

export default Map;

