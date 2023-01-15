import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Cartesian3 } from 'cesium';

const Container = styled.div`
  width: 100%;
  height: 100%;
  background-color: #ffffee;
  border-radius: 10px;
  box-shadow: 0 0 5px 5px rgba(0, 0, 0, 0.3);
`;

const HeightLabel = styled.div.attrs(({ y }) => ({
  style: { top: `calc(${y} * 100%)` }
}))`
  position: absolute;
  color: black;
  opacity: 0.8;
  left: 1%;
  transform: translate(0, -50%);
  font-size: 0.9vw;
`;

const DistanceLabel = styled.div.attrs(({ x }) => ({
  style: { left: `calc(${x} * 100%)` }
}))`
  position: absolute;
  color: black;
  opacity: 0.8;
  bottom: 1%;
  transform: translate(-50%, 0);
  font-size: 1.9vh;
`;

const CurrentPointContainer = styled.div.attrs(({ x = 0, y = 0 }) => ({
  style: {
    transform: `translate(${x * 100}%, ${y * 100}%)`,
  }}))`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`;

const CurrentHeightLine = styled.div.attrs(({ x }) => ({
  style: {
    right: `${100 - x * 100}%`
  }}))`
  position: absolute;
  height: 2px;
  top: 0;
  left: 6%;
  transform: translate(0, -50%);
  background-color: darkred;
`;

const CurrentHeightLabel = styled.div`
  position: absolute;
  left: 0.4%;
  top: 0;
  width: 5%;
  padding: 0 0.6% 0 0;
  transform: translate(0, -50%);
  background-color: darkred;
  font-size: 0.9vw;
  border-radius: 4px;
  text-align: right;
`;

const CurrentDistanceLine = styled.div.attrs(({ y }) => ({
  style: {
    top: `${y * 100}%`
  }}))`
  position: absolute;
  width: 2px;
  left: 0;
  bottom: 20%;
  transform: translate(-50%, 0);
  background-color: darkred;
`;

const CurrentDistanceLabel = styled.div`
  position: absolute;
  bottom: 0.8%;
  left: 0;
  padding: 0 0.6% 0 0.6%;
  transform: translate(-50%, 0);
  background-color: darkred;
  font-size: 1.9vh;
  border-radius: 4px;
`;

const CurrentDot = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 15px;
  width: 15px;
  border-radius: 15px;
  transform: translate(-50%, -50%);
  background-color: darkred;
`;

const loadTrack = (gpxPath) => fetch(gpxPath).then((response) => response.text());

const flattenHeightSpikes = (points) => {
  return points.map((point, index) => {
    const previousHeight = points[index - 1]?.height;
    const height = point.height;
    const nextHeight = points[index + 1]?.height;
    if (
      previousHeight &&
      nextHeight &&
      ((previousHeight < height && nextHeight < height) || (previousHeight > height && nextHeight > height)) &&
      Math.abs(height - previousHeight) > 10 &&
      Math.abs(height - nextHeight) > 10
    ) {
      return {
        ...point,
        height: (previousHeight + nextHeight) / 2.0
      };
    }
    return point;
  });
};

const getHeightGaps = (maxHeightDifference) => {
  if (maxHeightDifference > 1000) {
    return {
      main: 500,
      sub: 100
    };
  } else if (maxHeightDifference > 500) {
    return {
      main: 250,
      sub: 50
    };
  }
  return {
    main: 100,
    sub: 20
  };
};

const getDistanceGaps = (maxDistance) => {
  if (maxDistance > 50000) {
    return {
      main: 25000,
      sub: 5000
    };
  } else if (maxDistance > 10000) {
    return {
      main: 5000,
      sub: 1000
    };
  } else if (maxDistance > 5000) {
    return {
      main: 2500,
      sub: 500
    };
  }
  return {
    main: 1000,
    sub: 200
  };
};

const parseTrackData = (gpxRaw) => {
  let lastPosition = null;
  const trackData = {
    minHeight: 9999,
    maxHeight: 0,
    maxDistance: 0,
    points: []
  };
  const doc = new window.DOMParser().parseFromString(gpxRaw, 'text/xml');
  Array.prototype.slice.call(doc.getElementsByTagName('trkpt')).forEach((trackPoint) => {
    const longitude = parseFloat(trackPoint.getAttribute('lon'));
    const latitude = parseFloat(trackPoint.getAttribute('lat'));
    const height = parseFloat(trackPoint.getElementsByTagName('ele')[0].textContent);
    const time = new Date(trackPoint.getElementsByTagName('time')[0].textContent).getTime();

    const position = Cartesian3.fromDegrees(longitude, latitude, height);
    const distanceDifference = lastPosition ? Cartesian3.distance(position, lastPosition) : 0;
    trackData.maxDistance += distanceDifference;
    trackData.minHeight = Math.min(trackData.minHeight, height);
    trackData.maxHeight = Math.max(trackData.maxHeight, height);

    const lastHeight = trackData.points[trackData.points.length - 1]?.height;
    if (!lastHeight || Math.abs(height - lastHeight) > 5) {
      trackData.points.push({
        time,
        distance: trackData.maxDistance,
        height
      });
    }

    lastPosition = position;
  });
  trackData.points = flattenHeightSpikes(trackData.points);
  trackData.heightGaps = getHeightGaps(trackData.maxHeight - trackData.minHeight);
  trackData.distanceGaps = getDistanceGaps(trackData.maxDistance);

  return trackData;
};

const distanceToGraph = (trackData, distance) => 0.07 + 0.92 * (distance / trackData.maxDistance);
const heightToGraph = (trackData, height) =>
  0.1 + 0.65 * (1 - (height - trackData.minHeight) / (trackData.maxHeight - trackData.minHeight));

const formatHeight = (height) => `${Math.round(height)}m`;
const formatDistance = (distance) => `${(Math.round(distance / 100) / 10).toFixed(1)}km`;

const buildGraphPoints = (trackData) => {
  return trackData.points
    .map((point, index) => {
      const x = distanceToGraph(trackData, point.distance);
      const y = heightToGraph(trackData, point.height);
      return `${index ? 'L' : 'M'} ${x} ${y}`;
    })
    .join(' ');
};

const renderGraphPath = (trackData) => (
  <path
    key="graphPath"
    d={buildGraphPoints(trackData)}
    stroke="#886622"
    strokeWidth="3px"
    strokeLinecap="round"
    vectorEffect="non-scaling-stroke"
    fill="none"
  />
);

const renderHeightLines = (trackData, gap, main) => {
  const elements = [];
  for (let height = 0; height < trackData.maxHeight; height += gap) {
    if (height < trackData.minHeight) {
      continue;
    }
    const y = heightToGraph(trackData, height);
    elements.push(
      <path
        key={`${main ? 'main' : 'sub'}_${height}_height_line`}
        d={`M ${main ? 0.06 : 0.07} ${y} L 0.99 ${y}`}
        stroke="gray"
        strokeWidth={main ? '1px' : '0.1px'}
        vectorEffect="non-scaling-stroke"
        fill="none"
      />
    );
  }
  return elements;
};

const renderDistanceLines = (trackData, gap, main) => {
  const elements = [];
  for (let distance = 0; distance < trackData.maxDistance; distance += gap) {
    const x = distanceToGraph(trackData, distance);
    elements.push(
      <path
        key={`${main ? 'main' : 'sub'}_${distance}_distance_line`}
        d={`M ${x} 0.1 L ${x} ${main ? 0.77 : 0.75}`}
        stroke="gray"
        strokeWidth={main ? '1px' : '0.1px'}
        vectorEffect="non-scaling-stroke"
        fill="none"
      />
    );
  }
  return elements;
};

const Graph = React.memo(({ trackData }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" width="100%" height="100%" preserveAspectRatio="none">
      {[
        ...renderHeightLines(trackData, trackData.heightGaps.sub, false),
        ...renderHeightLines(trackData, trackData.heightGaps.main, true),
        ...renderDistanceLines(trackData, trackData.distanceGaps.sub, false),
        ...renderDistanceLines(trackData, trackData.distanceGaps.main, true),
        renderGraphPath(trackData)
      ]}
    </svg>
  );
});

const renderHeightLabels = (trackData, gap) => {
  const elements = [];
  for (let height = 0; height < trackData.maxHeight; height += gap) {
    if (height < trackData.minHeight) {
      continue;
    }
    const y = heightToGraph(trackData, height);
    elements.push(
      <HeightLabel key={`main_${height}_height_label`} y={y}>{formatHeight(height)}</HeightLabel>
    );
  }
  return elements;
};

const renderDistanceLabels = (trackData, gap) => {
  const elements = [];
  for (let distance = 0; distance < trackData.maxDistance; distance += gap) {
    const x = distanceToGraph(trackData, distance);
    elements.push(
      <DistanceLabel key={`main_${distance}_distance_label`} x={x}>{formatDistance(distance)}</DistanceLabel>
    );
  }
  return elements;
};

const CurrentPoint = ({ trackData, currentPoint }) => {
  const x = distanceToGraph(trackData, currentPoint.distance);
  const y = heightToGraph(trackData, currentPoint.height);
  return <>
    <CurrentPointContainer y={y}><CurrentHeightLine x={x} /></CurrentPointContainer>
    <CurrentPointContainer y={y}><CurrentHeightLabel>{formatHeight(currentPoint.height)}</CurrentHeightLabel></CurrentPointContainer>
    <CurrentPointContainer x={x}><CurrentDistanceLine y={y} /></CurrentPointContainer>
    <CurrentPointContainer x={x}><CurrentDistanceLabel>{formatDistance(currentPoint.distance)}</CurrentDistanceLabel></CurrentPointContainer>
    <CurrentPointContainer x={x} y={y}><CurrentDot /></CurrentPointContainer>
  </>;
};

const convertTimeToInterpolatedPoint = (trackData, isoTime) => {
  const time = new Date(isoTime).getTime();
  const previousPoint = trackData.points.findLast((point) => point.time < time) || trackData.points[0];
  const nextPoint =
    trackData.points.find((point) => time < point.time) || trackData.points[trackData.points.length - 1];
  if (nextPoint.time === previousPoint.time) {
    return {
      time,
      distance: previousPoint.distance,
      height: previousPoint.height
    };
  }
  const ratio = 1 - ((nextPoint.time - time) / (nextPoint.time - previousPoint.time));
  return {
    time,
    distance: previousPoint.distance + (nextPoint.distance - previousPoint.distance) * ratio,
    height: previousPoint.height + (nextPoint.height - previousPoint.height) * ratio
  };
};

const HeightGraph = (props) => {
  const [trackData, setTrackData] = useState(null);
  const [currentPoint, setCurrentPoint] = useState(null);
  useEffect(() => {
    loadTrack(props.gpxPath).then(parseTrackData).then(setTrackData);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (trackData && props.time) {
      const point = convertTimeToInterpolatedPoint(trackData, props.time);
      setCurrentPoint(point);
    }
  }, [props.time, trackData]);

  if (!trackData || !currentPoint) {
    return null;
  }

  return (
    <Container>
      <Graph trackData={trackData} />
      {[
        ...renderHeightLabels(trackData, trackData.heightGaps.main),
        ...renderDistanceLabels(trackData, trackData.distanceGaps.main)
      ]}
      <CurrentPoint trackData={trackData} currentPoint={currentPoint} />
    </Container>
  );
};

HeightGraph.propTypes = {
  gpxPath: PropTypes.string.isRequired
};

export default HeightGraph;
