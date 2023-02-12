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
      distance: track.maxDistance,
      height
    });
  });
  return track;
};

const loadTrack = async (reportPath) => {
  const response = await fetch('/tracks' + reportPath + '.gpx');
  const gpxRaw = await response.text();
  return parseGpxRaw(gpxRaw);
};

export default loadTrack;
