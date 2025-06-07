import React, { useMemo, useEffect, useRef, useState, useCallback } from 'react';
import { withPrefix } from 'gatsby';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  ArcGisBaseMapType,
  ArcGisMapServerImageryProvider,
  BillboardGraphics,
  Cartesian3,
  Cartographic,
  CesiumTerrainProvider,
  ClockRange,
  Color,
  createWorldTerrainAsync,
  Credit,
  Ellipsoid,
  EllipsoidGeodesic,
  Entity,
  EventHelper,
  ExtrapolationType,
  GeographicTilingScheme,
  HeadingPitchRange,
  HeightReference,
  ImageryLayer,
  Ion,
  IonImageryProvider,
  JulianDate,
  Math as CesiumMath,
  PolylineGraphics,
  PolylineOutlineMaterialProperty,
  Rectangle,
  SampledPositionProperty,
  UrlTemplateImageryProvider,
  VerticalOrigin,
  Viewer,
  WebMapTileServiceImageryProvider
} from 'cesium';

Ion.defaultAccessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZWE0NjYxMC0yY2Y1LTRmZmItODI1My1iMmRiYTU4NTMyYzEiLCJpZCI6MTgxMSwiYXNzZXRzIjpbMiwxXSwiaWF0IjoxNTMwMjA0NDI1fQ.OnhSNAVYfbQ2mBqo9QXF_-VSo_UIPt2Hw1FgvSID1Nk';

const CesiumContainer = styled.div`
  position: fixed;
  z-index: 3;
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

const extractTrackData = (track) => {
  const trackData = {
    startTime: track.startTime,
    stopTime: track.stopTime,
    sampledPosition: new SampledPositionProperty(),
    positions: []
  };
  trackData.sampledPosition.backwardExtrapolationType = ExtrapolationType.HOLD;
  trackData.sampledPosition.forwardExtrapolationType = ExtrapolationType.HOLD;
  track.points.forEach((point, index) => {
    if (
      trackData.positions.length === 0 ||
      Cartesian3.distance(point.position, trackData.positions[trackData.positions.length - 1]) > 10 ||
      index === track.points.length - 1
    ) {
      trackData.sampledPosition.addSample(point.time, point.position);
      trackData.positions.push(point.position);
    }
  });
  return trackData;
};

const catchInvalidSwissTopoTiles = (provider) => {
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
          console.warn('Replacing possible invalid terrain tile by random correct tile', indexLengths);
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
};

const createTerrainProvider = async (hideSwissTopo) => {
  if (hideSwissTopo) {
    return await createWorldTerrainAsync({
      requestVertexNormals: true
    });
  }
  const provider = await CesiumTerrainProvider.fromUrl(
    'https://3d.geo.admin.ch/ch.swisstopo.terrain.3d/v1',
    {
      requestVertexNormals: false,
      credit: new Credit('geodata © swisstopo', true)
    }
  );
  return catchInvalidSwissTopoTiles(provider);
};

const createGlobeRectangle = (positions) => {
  const globeRectangle = Rectangle.fromCartesianArray(positions, Ellipsoid.WGS84);
  globeRectangle.east += 0.01;
  globeRectangle.west -= 0.01;
  globeRectangle.north += 0.01;
  globeRectangle.south -= 0.01;
  return globeRectangle;
};

const setupViewer = async (trackData, hideSwissTopo, baseLayerProvider) => {
  const viewer = new Viewer('cesiumContainer', {
    terrainProvider: await createTerrainProvider(hideSwissTopo),
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
    msaaSamples: 4,
    showRenderLoopErrors: false,
    baseLayer: ImageryLayer.fromProviderAsync(baseLayerProvider)
  });
  viewer.scene.globe.depthTestAgainstTerrain = true;
  viewer.scene.globe.tileCacheSize = 1000;
  viewer.scene.globe.cartographicLimitRectangle = createGlobeRectangle(trackData.positions);
  viewer.scene.globe.enableLighting = true;
  // noinspection JSUnresolvedVariable
  viewer.scene._renderError.raiseEvent = (scene, error) => {
    console.error(error);
  };
  return viewer;
};

const createTrackEntity = (positions, winter) => {
  const color = winter ? Color.DARKBLUE : Color.WHITE;
  const polyline = new PolylineGraphics({
    positions,
    material: new PolylineOutlineMaterialProperty({
      color: color.withAlpha(0.7),
      outlineWidth: 4,
      outlineColor: Color.BLACK.withAlpha(0.3)
    }),
    width: 8.0,
    clampToGround: true
  });

  return new Entity({
    id: 'track',
    polyline
  });
};

const loadHiker = () => {
  return ['front', 'back', 'left', 'right'].reduce((hiker, orientation) => {
    hiker[orientation] = new BillboardGraphics({
      image: '/assets/hiker-' + orientation + '.svg',
      heightReference: HeightReference.CLAMP_TO_GROUND,
      verticalOrigin: VerticalOrigin.BOTTOM,
      depthTestAgainstTerrain: 0
    });
    return hiker;
  }, {});
};

const createHiker = (entities, sampledPosition) => {
  const hiker = loadHiker();
  hiker.entity = new Entity({
    id: 'hiker',
    billboard: hiker.back,
    position: sampledPosition
  });
  entities.add(hiker.entity);
  return hiker;
};

const createHdRectangle = (positions) => {
  const hdRectangle = Rectangle.fromCartesianArray(positions, Ellipsoid.WGS84);
  hdRectangle.east += 0.0005;
  hdRectangle.west -= 0.0005;
  hdRectangle.north += 0.00025;
  hdRectangle.south -= 0.00025;
  return hdRectangle;
};

const createBaseLayerProvider = (reduceDetail) => {
  const useBing = true;
  if (useBing) {
    return IonImageryProvider.fromAssetId(2)
  }

  return ArcGisMapServerImageryProvider.fromBasemapType(
    ArcGisBaseMapType.SATELLITE,
    {
      token: 'AAPTxy8BH1VEsoebNVZXo8HurPOoBL7NDOOfQux77KRsFQLW5AIXa29VzxmYezCd6K346tLQF_ykj8y8PrOsV0JrpDzDF8_fIBQpnI3R4oFlqY73fyJiuCO3Qfqard2CnE5spi7IVFosqPbSgARw7T7cyx584x68DIpC9SHg4F3R3ny5MW6HOISQ5ATR8Og5wv1jjzOE8dXpvuxZjbOksm3gUmpysCQTWrEfGs2EP_T2JuA.AT1_L5fYNUnV'
    }
  ).then(provider => {
    if (reduceDetail) {
      provider._maximumLevel = 13
    }
    return provider;
  });
};

const createSwissSatelliteProvider = (hdRectangle) => {
  return new UrlTemplateImageryProvider({
    url: 'https://wmts{s}.geo.admin.ch/1.0.0/ch.swisstopo.swissimage-product/default/2024/4326/{z}/{x}/{y}.jpeg',
    subdomains: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    minimumLevel: 0,
    maximumLevel: 19,
    tilingScheme: new GeographicTilingScheme({
      numberOfLevelZeroTilesX: 2,
      numberOfLevelZeroTilesY: 1
    }),
    rectangle: hdRectangle,
    credit: new Credit('geodata © swisstopo', true)
  });
};

const createAustriaSatelliteProvider = (hdRectangle) => {
  return new WebMapTileServiceImageryProvider({
    url: 'https://mapsneu.wien.gv.at/basemap/bmaporthofoto30cm/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.jpeg',
    layer: 'bmaporthofoto30cm',
    style: 'normal',
    tileMatrixSetID: 'google3857',
    rectangle: hdRectangle,
    credit: new Credit('<a href="https://www.basemap.at/" target="_blank">Datenquelle: basemap.at</a>', true)
  });
};

const turnToWinter = (scene) => {
  const layers = scene.imageryLayers;
  for (let i = 0; i < layers.length; i++) {
    const layer = layers.get(i);
    layer.contrast = 1.7;
    layer.saturation = 0.1;
    layer.brightness = 1.6;
  }
};

const findOptimalCameraHeight = (viewer, hikerPosition) => {
  const cameraPos = viewer.camera.positionCartographic;
  let optimalHeight = 0;
  for (let distanceFactor = 0.0; distanceFactor < 0.95; distanceFactor += 0.1) {
    const samplePos = new Cartographic(
      hikerPosition.longitude * distanceFactor + cameraPos.longitude * (1.0 - distanceFactor),
      hikerPosition.latitude * distanceFactor + cameraPos.latitude * (1.0 - distanceFactor),
      hikerPosition.height * distanceFactor + cameraPos.height * (1.0 - distanceFactor)
    );
    const terrainHeight = viewer.scene.globe.getHeight(samplePos);
    optimalHeight = Math.max(
      optimalHeight,
      hikerPosition.height + (terrainHeight - hikerPosition.height) / (1.0 - distanceFactor)
    );
  }
  return optimalHeight + 150;
};

const calculateMovedTime = (viewer, secondsToMove, wrap = false) => {
  const newTime = new JulianDate();
  JulianDate.addSeconds(viewer.clock.currentTime, secondsToMove, newTime);
  const secondsAfterEnd = JulianDate.secondsDifference(newTime, viewer.clock.stopTime);
  if (secondsAfterEnd > 0) {
    if (wrap) {
      JulianDate.addSeconds(viewer.clock.startTime, secondsAfterEnd, newTime);
    } else {
      return viewer.clock.stopTime;
    }
  }
  return newTime;
};

const updateCamera = (viewer, hiker, smooth = true) => {
  const terrainHeightUnderCamera = viewer.scene.globe.getHeight(viewer.camera.positionCartographic);
  const allowedMinimumCameraHeight = terrainHeightUnderCamera + 10;
  const cameraHeight = viewer.camera.positionCartographic.height;
  if (!viewer.clock.shouldAnimate && (!allowedMinimumCameraHeight || cameraHeight > allowedMinimumCameraHeight)) {
    return;
  }

  const newLookAtPosition = hiker.entity.position.getValue(calculateMovedTime(viewer, smooth ? 60 : 0));
  const newLookAtCart = Cartographic.fromCartesian(newLookAtPosition);
  const newLookAtHeight = viewer.scene.globe.getHeight(newLookAtCart) || newLookAtCart.height;
  Cartesian3.fromRadians(newLookAtCart.longitude, newLookAtCart.latitude, newLookAtHeight, Ellipsoid.default, newLookAtPosition);
  Cartographic.fromCartesian(newLookAtPosition, Ellipsoid.default, newLookAtCart);

  let newHeading = viewer.camera.heading;
  let newTilt = CesiumMath.toDegrees(viewer.camera.pitch);
  if (viewer.clock.shouldAnimate) {
    const futureTime = calculateMovedTime(viewer, 20 * 60, true);
    const futureHikerPosition = hiker.entity.position.getValue(futureTime);
    const futureCart = Cartographic.fromCartesian(futureHikerPosition);
    const geodesic = new EllipsoidGeodesic(newLookAtCart, futureCart);
    let necessaryHeadingChange = geodesic.startHeading - viewer.camera.heading;
    if (necessaryHeadingChange > Math.PI) {
      necessaryHeadingChange -= 2 * Math.PI;
    }
    if (necessaryHeadingChange < -Math.PI) {
      necessaryHeadingChange += 2 * Math.PI;
    }
    newHeading += necessaryHeadingChange * 0.01;

    const optimalCameraHeight = findOptimalCameraHeight(viewer, newLookAtCart);
    if (cameraHeight && optimalCameraHeight) {
      newTilt += (cameraHeight - optimalCameraHeight) * 0.003;
      newTilt = Math.max(newTilt, -90);
      newTilt = Math.min(newTilt, 0);
    }
  } else {
    newTilt = cameraHeight - allowedMinimumCameraHeight;
  }
  const newPitch = CesiumMath.toRadians(newTilt);

  const previousCameraPosition = viewer.camera.positionWC.clone();
  viewer.camera.lookAt(newLookAtPosition, new HeadingPitchRange(newHeading, newPitch, 500));
  if (smooth && viewer.clock.shouldAnimate) {
    const smoothCameraPosition = new Cartesian3();
    Cartesian3.lerp(previousCameraPosition, viewer.camera.positionWC, 0.1, smoothCameraPosition);
    viewer.camera.setView({
      destination: smoothCameraPosition,
      orientation: {
        heading: viewer.camera.heading,
        pitch: viewer.camera.pitch
      }
    });
  }
};

const updateSpeed = (viewer, targetTime, onAnimationStopped) => {
  if (!targetTime.current) {
    return;
  }
  const timeDifference = JulianDate.secondsDifference(targetTime.current, viewer.clock.currentTime);
  let targetMultiplier = timeDifference * 2;
  targetMultiplier = Math.max(Math.min(targetMultiplier, 100), -100);
  viewer.clock.multiplier = targetMultiplier;
  if (Math.abs(targetMultiplier) < 20 || Math.abs(timeDifference) <= 10) {
    if (viewer.clock.shouldAnimate) {
      onAnimationStopped();
    }
    viewer.clock.shouldAnimate = false;
  }
};

const updateHiker = (viewer, hiker) => {
  const entity = hiker.entity;

  const currentPos = entity.position.getValue(viewer.clock.currentTime);
  if (!currentPos) {
    return;
  }
  const currentCart = Cartographic.fromCartesian(currentPos);

  const futureTime = new JulianDate();
  JulianDate.addSeconds(viewer.clock.currentTime, 30, futureTime);
  const futureCart = Cartographic.fromCartesian(entity.position.getValue(futureTime));

  const geodesic = new EllipsoidGeodesic(currentCart, futureCart);
  const hikerHeading = geodesic.startHeading;
  const cameraHeading = viewer.camera.heading;
  const viewAngle = (cameraHeading - hikerHeading + 2 * Math.PI) % (2 * Math.PI);

  if (viewAngle >= 0.25 * Math.PI && viewAngle < 0.75 * Math.PI) {
    entity.billboard = hiker.left;
  } else if (viewAngle >= 0.75 * Math.PI && viewAngle < 1.25 * Math.PI) {
    entity.billboard = hiker.front;
  } else if (viewAngle >= 1.25 * Math.PI && viewAngle < 1.75 * Math.PI) {
    entity.billboard = hiker.right;
  } else {
    entity.billboard = hiker.back;
  }
};

const tickChanged = (viewer, hiker, targetTime, onAnimationStopped) => {
  updateCamera(viewer, hiker);
  updateSpeed(viewer, targetTime, onAnimationStopped);
  updateHiker(viewer, hiker);
};

const setupClock = (clock, startTime, stopTime) => {
  clock.startTime = startTime;
  clock.stopTime = stopTime;
  clock.clockRange = ClockRange.CLAMPED;
  clock.currentTime = startTime;
};

const convertWishTimeIntoTargetTime = (clock, newTime, timeShift) => {
  if (newTime === 'start') {
    return clock.startTime;
  }
  if (newTime === 'end') {
    return clock.stopTime;
  }
  const newTargetTime = JulianDate.fromIso8601(newTime);
  if (timeShift) {
    JulianDate.addSeconds(newTargetTime, timeShift, newTargetTime);
  }
  if (JulianDate.compare(clock.startTime, newTargetTime) >= 0) {
    return clock.startTime;
  }
  if (JulianDate.compare(newTargetTime, clock.stopTime) >= 0) {
    return clock.stopTime;
  }
  return newTargetTime;
};

const wishTimeChanged = (clock, targetTime, wishTime, timeShift, onAnimationStarted) => {
  targetTime.current = convertWishTimeIntoTargetTime(clock, wishTime, timeShift);
  clock.shouldAnimate = true;
  onAnimationStarted();
};

const jumpToTargetTime = (viewer, hiker, targetTime) => {
  if (targetTime.current) {
    viewer.clock.currentTime = targetTime.current;
    viewer.clock.shouldAnimate = true;
    updateCamera(viewer, hiker, false);
    viewer.clock.shouldAnimate = false;
  }
};

const setupMap = async (trackData, hideSwissTopo, detailMap, winter) => {
  const baseLayerProvider = createBaseLayerProvider(Boolean(detailMap));
  const viewer = await setupViewer(trackData, hideSwissTopo, baseLayerProvider);
  viewer.entities.add(createTrackEntity(trackData.positions, winter));
  const hdRectangle = createHdRectangle(trackData.positions);
  switch (detailMap) {
    case 'swiss':
      viewer.scene.imageryLayers.addImageryProvider(createSwissSatelliteProvider(hdRectangle));
      break;
    case 'austria':
      viewer.scene.imageryLayers.addImageryProvider(createAustriaSatelliteProvider(hdRectangle));
      break;
    default:
  }
  if (winter) {
    turnToWinter(viewer.scene);
  }
  return viewer;
};

const prepareStart = async (trackData, viewer, hiker, targetTime, onAnimationStarted, time, timeShift) => {
  setupClock(viewer.clock, trackData.startTime, trackData.stopTime);

  wishTimeChanged(viewer.clock, targetTime, time, timeShift, onAnimationStarted);
  jumpToTargetTime(viewer, hiker, targetTime);

  const eventHelper = new EventHelper();
  await new Promise((resolve) => {
    const listener = { remove: null };
    listener.remove = eventHelper.add(viewer.scene.globe.tileLoadProgressEvent, (queue) => {
      if (queue <= 0) {
        listener.remove();
        resolve();
      }
    });
  });

  return viewer.clock;
};

const Map = (props) => {
  const { track, wishTime, timeShift, onWishTimeReached, onTimeChanged } = props;

  const [mapStatus, setMapStatus] = useState('wait');
  const [viewer, setViewer] = useState(null);
  const [hiker, setHiker] = useState(null);
  const [clock, setClock] = useState(null);
  const targetTime = useRef(null);

  const onAnimationStarted = useCallback(() => {
    setMapStatus('wait');
  }, []);

  const onAnimationStopped = useCallback(() => {
    if (onWishTimeReached) {
      onWishTimeReached();
    }
    setMapStatus('free');
  }, [onWishTimeReached]);

  const trackData = useMemo(() => track && extractTrackData(track), [track]);

  useEffect(() => {
    async function createViewer() {
      if (trackData) {
        const newViewer = await setupMap(trackData, props.hideSwissTopo, props.detailMap, props.winter);
        setViewer(newViewer);
      }
    }
    createViewer();
    return () => {
      if (viewer) {
        viewer.destroy();
        setViewer(null);
      }
    };
  }, [trackData]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (trackData && viewer) {
      setHiker(createHiker(viewer.entities, trackData.sampledPosition));
    }
  }, [trackData, viewer]);

  useEffect(() => {
    if (trackData && viewer && hiker) {
      prepareStart(trackData, viewer, hiker, targetTime, onAnimationStarted, wishTime, timeShift).then(setClock);
    }
  }, [trackData, viewer, hiker]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (clock) {
      wishTimeChanged(clock, targetTime, wishTime, timeShift, onAnimationStarted);
    }
  }, [clock, wishTime, timeShift, onAnimationStarted]);

  useEffect(() => {
    if (clock) {
      const onTick = () => {
        try {
          tickChanged(viewer, hiker, targetTime, onAnimationStopped);
          if (onTimeChanged) {
            onTimeChanged(JulianDate.toIso8601(viewer.clock.currentTime));
          }
        } catch (error) {
          console.log('onTickError', error);
        }
      };
      clock.onTick.addEventListener(onTick);
      return () => clock.onTick.removeEventListener(onTick);
    }
  }, [onAnimationStopped, onTimeChanged, viewer, hiker, targetTime, clock]);

  return (
    <div>
      <link href={withPrefix('Cesium/Widgets/widgets.css')} rel="stylesheet" type="text/css" />
      <CesiumContainer
        id="cesiumContainer"
        key="cesiumContainer"
        className={props.size + ' ' + mapStatus}
        onClick={props.onClick}
      />
    </div>
  );
};

Map.propTypes = {
  size: PropTypes.string.isRequired,
  track: PropTypes.shape({
    startTime: PropTypes.object.isRequired,
    stopTime: PropTypes.object.isRequired,
    points: PropTypes.arrayOf(
      PropTypes.shape({
        time: PropTypes.object.isRequired,
        position: PropTypes.object.isRequired
      })
    ).isRequired
  }),
  wishTime: PropTypes.string.isRequired,
  timeShift: PropTypes.number,
  detailMap: PropTypes.string,
  hideSwissTopo: PropTypes.bool,
  winter: PropTypes.bool,
  onClick: PropTypes.func,
  onWishTimeReached: PropTypes.func,
  onTimeChanged: PropTypes.func
};

export default Map;
