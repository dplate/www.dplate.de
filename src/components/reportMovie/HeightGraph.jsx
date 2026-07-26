import React, { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import styles from './HeightGraph.module.css';

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
      <div key={`main_${height}_height_label`} className={styles.heightLabel} style={{ top: `calc(${y} * 100%)` }}>
        {formatHeight(height)}
      </div>
    );
  }
  return elements;
};

const renderDistanceLabels = (trackData, gap) => {
  const elements = [];
  for (let distance = 0; distance < trackData.maxDistance; distance += gap) {
    const x = distanceToGraph(trackData, distance);
    elements.push(
      <div key={`main_${distance}_distance_label`} className={styles.distanceLabel} style={{ left: `calc(${x} * 100%)` }}>
        {formatDistance(distance)}
      </div>
    );
  }
  return elements;
};

const CurrentPoint = ({ trackData, currentPoint }) => {
  const x = distanceToGraph(trackData, currentPoint.distance);
  const y = heightToGraph(trackData, currentPoint.height);
  return (
    <>
      <div className={styles.currentPointContainer} style={{ transform: `translate(0%, ${y * 100}%)` }}>
        <div className={styles.currentHeightLine} style={{ right: `${100 - x * 100}%` }} />
      </div>
      <div className={styles.currentPointContainer} style={{ transform: `translate(0%, ${y * 100}%)` }}>
        <div className={styles.currentHeightLabel}>{formatHeight(currentPoint.height)}</div>
      </div>
      <div className={styles.currentPointContainer} style={{ transform: `translate(${x * 100}%, 0%)` }}>
        <div className={styles.currentDistanceLine} style={{ top: `${y * 100}%` }} />
      </div>
      <div className={styles.currentPointContainer} style={{ transform: `translate(${x * 100}%, 0%)` }}>
        <div className={styles.currentDistanceLabel}>{formatDistance(currentPoint.distance)}</div>
      </div>
      <div className={styles.currentPointContainer} style={{ transform: `translate(${x * 100}%, ${y * 100}%)` }}>
        <div className={styles.currentDot} />
      </div>
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
    <div className={styles.container} style={{ opacity: props.visible ? 0.9 : 0.0 }}>
      <Graph trackData={trackData} />
      {[
        ...renderHeightLabels(trackData, trackData.heightGaps.main),
        ...renderDistanceLabels(trackData, trackData.distanceGaps.main)
      ]}
      <CurrentPoint trackData={trackData} currentPoint={currentPoint} />
    </div>
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
