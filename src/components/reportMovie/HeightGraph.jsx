import React, { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Container = styled.div.attrs(({ $opacity }) => ({
  style: { opacity: $opacity }
}))`
  position: fixed;
  bottom: 3vh;
  height: 20vh;
  width: 75vw;
  left: 50%;
  transform: translate(-50%, 0);
  z-index: 4;
  transition: opacity 1s ease-in-out;
  background-color: #ffffee;
  border-radius: 10px;
  box-shadow: 0 0 5px 5px rgba(0, 0, 0, 0.3);
`;

const HeightLabel = styled.div.attrs(({ $y }) => ({
  style: { top: `calc(${$y} * 100%)` }
}))`
  position: absolute;
  color: black;
  opacity: 0.8;
  left: 1.3%;
  transform: translate(0, -50%);
  font-size: 1.2vw;
`;

const DistanceLabel = styled.div.attrs(({ $x }) => ({
  style: { left: `calc(${$x} * 100%)` }
}))`
  position: absolute;
  color: black;
  opacity: 0.8;
  bottom: 3%;
  transform: translate(-50%, 0);
  font-size: 2.1vh;
  line-height: 1.4;
`;

const CurrentPointContainer = styled.div.attrs(({ $x = 0, $y = 0 }) => ({
  style: {
    transform: `translate(${$x * 100}%, ${$y * 100}%)`
  }
}))`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`;

const CurrentHeightLine = styled.div.attrs(({ $x }) => ({
  style: {
    right: `${100 - $x * 100}%`
  }
}))`
  position: absolute;
  height: 2px;
  top: 0;
  left: 6%;
  transform: translate(0, -50%);
  background-color: darkred;
`;

const CurrentHeightLabel = styled.div`
  position: absolute;
  left: 0.7%;
  top: 0;
  width: 5.7%;
  padding: 0 0.6% 0 0;
  transform: translate(0, -50%);
  background-color: darkred;
  font-size: 1.2vw;
  border-radius: 4px;
  text-align: right;
`;

const CurrentDistanceLine = styled.div.attrs(({ $y }) => ({
  style: {
    top: `${$y * 100}%`
  }
}))`
  position: absolute;
  width: 2px;
  left: 0;
  bottom: 15%;
  transform: translate(-50%, 0);
  background-color: darkred;
`;

const CurrentDistanceLabel = styled.div`
  position: absolute;
  bottom: 3%;
  left: 0;
  padding: 0 0.6% 0 0.6%;
  transform: translate(-50%, 0);
  background-color: darkred;
  font-size: 2.1vh;
  line-height: 1.4;
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

const extractTrackData = (track) => {
  const trackData = {
    ...track,
    points: [],
    heightGaps: getHeightGaps(track.maxHeight - track.minHeight),
    distanceGaps: getDistanceGaps(track.maxDistance)
  };
  track.points.forEach((point) => {
    const lastHeight = trackData.points[trackData.points.length - 1]?.height;
    if (!lastHeight || Math.abs(point.height - lastHeight) > 5) {
      trackData.points.push({
        timestamp: point.timestamp,
        distance: point.distance,
        height: point.height
      });
    }
  });
  trackData.points = flattenHeightSpikes(trackData.points);

  return trackData;
};

const distanceToGraph = (trackData, distance) => 0.08 + 0.91 * (distance / trackData.maxDistance);
const heightToGraph = (trackData, height) =>
  0.1 + 0.7 * (1 - (height - trackData.minHeight) / (trackData.maxHeight - trackData.minHeight));

const formatHeight = (height) => `${Math.round(height)} m`;
const formatDistance = (distance) => `${(Math.round(distance / 100) / 10).toFixed(1)} km`;

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
        d={`M ${main ? 0.07 : 0.08} ${y} L 0.99 ${y}`}
        stroke="gray"
        strokeWidth={main ? '1.5px' : '0.3px'}
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
        d={`M ${x} 0.1 L ${x} ${main ? 0.82 : 0.78}`}
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
      <HeightLabel key={`main_${height}_height_label`} $y={y}>
        {formatHeight(height)}
      </HeightLabel>
    );
  }
  return elements;
};

const renderDistanceLabels = (trackData, gap) => {
  const elements = [];
  for (let distance = 0; distance < trackData.maxDistance; distance += gap) {
    const x = distanceToGraph(trackData, distance);
    elements.push(
      <DistanceLabel key={`main_${distance}_distance_label`} $x={x}>
        {formatDistance(distance)}
      </DistanceLabel>
    );
  }
  return elements;
};

const CurrentPoint = ({ trackData, currentPoint }) => {
  const x = distanceToGraph(trackData, currentPoint.distance);
  const y = heightToGraph(trackData, currentPoint.height);
  return (
    <>
      <CurrentPointContainer $y={y}>
        <CurrentHeightLine $x={x} />
      </CurrentPointContainer>
      <CurrentPointContainer $y={y}>
        <CurrentHeightLabel>{formatHeight(currentPoint.height)}</CurrentHeightLabel>
      </CurrentPointContainer>
      <CurrentPointContainer $x={x}>
        <CurrentDistanceLine $y={y} />
      </CurrentPointContainer>
      <CurrentPointContainer $x={x}>
        <CurrentDistanceLabel>{formatDistance(currentPoint.distance)}</CurrentDistanceLabel>
      </CurrentPointContainer>
      <CurrentPointContainer $x={x} $y={y}>
        <CurrentDot />
      </CurrentPointContainer>
    </>
  );
};

const convertTimeToInterpolatedPoint = (trackData, isoTime) => {
  const timestamp = new Date(isoTime).getTime();
  const previousPoint = trackData.points.findLast((point) => point.timestamp < timestamp) || trackData.points[0];
  const nextPoint =
    trackData.points.find((point) => timestamp < point.timestamp) || trackData.points[trackData.points.length - 1];
  if (nextPoint.timestamp === previousPoint.timestamp) {
    return {
      timestamp,
      distance: previousPoint.distance,
      height: previousPoint.height
    };
  }
  const ratio = 1 - (nextPoint.timestamp - timestamp) / (nextPoint.timestamp - previousPoint.timestamp);
  return {
    timestamp,
    distance: previousPoint.distance + (nextPoint.distance - previousPoint.distance) * ratio,
    height: previousPoint.height + (nextPoint.height - previousPoint.height) * ratio
  };
};

const HeightGraph = (props) => {
  const [currentPoint, setCurrentPoint] = useState(null);

  const trackData = useMemo(() => extractTrackData(props.track), [props.track]);

  useEffect(() => {
    if (props.time) {
      const point = convertTimeToInterpolatedPoint(trackData, props.time);
      setCurrentPoint(point);
    }
  }, [props.time, trackData]);

  if (!currentPoint) {
    return null;
  }

  return (
    <Container $opacity={props.visible ? 0.9 : 0.0}>
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
  track: PropTypes.shape({
    minHeight: PropTypes.number.isRequired,
    maxHeight: PropTypes.number.isRequired,
    maxDistance: PropTypes.number.isRequired,
    points: PropTypes.arrayOf(
      PropTypes.shape({
        timestamp: PropTypes.number.isRequired,
        distance: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired
      })
    ).isRequired
  }).isRequired,
  time: PropTypes.string,
  visible: PropTypes.bool.isRequired
};

export default HeightGraph;
