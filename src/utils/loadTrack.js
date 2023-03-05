import { Cartesian3, JulianDate } from 'cesium';

const parseGpxRaw = (gpxRaw) => {
  const track = {
    startTime: null,
    stopTime: null,
    startTimestamp: null,
    stopTimestamp: null,
    minHeight: 9999,
    maxHeight: 0,
    maxDistance: 0,
    points: []
  };
  const doc = new window.DOMParser().parseFromString(gpxRaw, 'text/xml');
  Array.prototype.slice.call(doc.getElementsByTagName('trkpt')).forEach((trackPoint) => {
    const longitude = parseFloat(trackPoint.getAttribute('lon'));
    const latitude = parseFloat(trackPoint.getAttribute('lat'));
    const position = Cartesian3.fromDegrees(longitude, latitude, 0);
    const height = parseFloat(trackPoint.getElementsByTagName('ele')[0].textContent);
    const isoTime = trackPoint.getElementsByTagName('time')[0].textContent;
    const time = JulianDate.fromIso8601(isoTime);
    const timestamp = new Date(Date.parse(isoTime)).getTime();
    
    const lastPosition = track.points[track.points.length - 1]?.position;
    const distanceDifference = lastPosition ? Cartesian3.distance(position, lastPosition) : 0;
    
    const lastTimestamp = track.points[track.points.length - 1]?.timestamp;
    const timestampDifference = lastTimestamp ? timestamp - lastTimestamp : 0;

    track.startTime = track.startTime || time;
    track.stopTime = time;
    track.startTimestamp = track.startTimestamp || timestamp;
    track.stopTimestamp = timestamp;
    track.maxDistance += distanceDifference;
    track.minHeight = Math.min(track.minHeight, height);
    track.maxHeight = Math.max(track.maxHeight, height);

    track.points.push({
      position,
      time,
      timestamp,
      timestampDifference,
      distanceDifference,
      distance: track.maxDistance,
      height
    });
  });
  return track;
};

const getSpeeds = (timestamp, track) => {
  const pointMinuteBefore = track.points.find(point => point.timestamp > (timestamp - 60 * 1000));
  const pointMinuteLater = track.points.findLast(point => point.timestamp < (timestamp + 60 * 1000));
  if (pointMinuteBefore && pointMinuteLater) {
    const distance = pointMinuteLater.distance - pointMinuteBefore.distance;
    const climb =  pointMinuteLater.height - pointMinuteBefore.height;
    const duration = pointMinuteLater.timestamp - pointMinuteBefore.timestamp;
    if (duration < 60 * 1000) {
      return {
        distanceSpeed: 0.0,
        climbSpeed: 0.0
      }
    }
    return {
      distanceSpeed: distance / duration * 1000,
      climbSpeed: climb / duration * 1000
    }
  }
  return 1.0;
};

const getAction = (speed) => {
  if (speed < 0.2) {
    return 'pausing';
  }
  if (speed > 2.0) {
    return 'flying';
  }
  return 'walking';
}

const interpretTrack = (track) => {
  let maxWalkDistance = 0;
  let maxWalkDuration = 0;
  let maxWalkUp = 0;
  let maxWalkDown = 0;
  const interpretedPoints = track.points.map(point => {
    const { distanceSpeed, climbSpeed } = getSpeeds(point.timestamp, track);
    const action = getAction(distanceSpeed);
    if (action === 'walking') {
      maxWalkDistance += point.distanceDifference;
      maxWalkDuration += point.timestampDifference;
      maxWalkUp += climbSpeed > 0 ? climbSpeed * point.timestampDifference / 1000 : 0;
      maxWalkDown += climbSpeed < 0 ? -climbSpeed * point.timestampDifference / 1000 : 0;
    }
    return {
      ...point,
      distanceSpeed,
      climbSpeed,
      action,
      walkDistance: maxWalkDistance,
      walkDuration: maxWalkDuration,
    };
  });
  if (Math.abs(maxWalkUp - maxWalkDown) < 100) {
    maxWalkDown = Math.max(maxWalkUp, maxWalkDown);
    maxWalkUp = maxWalkDown;
  }
  return {
    ...track,
    maxWalkDistance,
    maxWalkDuration,
    maxWalkUp,
    maxWalkDown,
    points: interpretedPoints
  };
};

const loadTrack = async (reportPath) => {
  const response = await fetch('/tracks' + reportPath + '.gpx');
  const gpxRaw = await response.text();
  const track = parseGpxRaw(gpxRaw);
  return interpretTrack(track);
};

export default loadTrack;
