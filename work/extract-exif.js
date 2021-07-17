const fs = require('fs');
const jsonfile = require('jsonfile');
const exif = require('jpeg-exif');
const sizeOf = require('image-size');
const { DateTime } = require('luxon');

const extractExif = (photo, photosPath) => {
  if (!photo.date || !photo.width || !photo.height) {
    const path = photosPath + photo.name + '.jpg';
    const size = sizeOf(path);
    const data = exif.parseSync(path);
    // noinspection JSUnresolvedVariable
    const exifDateTime = data.SubExif && data.SubExif.DateTimeOriginal;
    if (exifDateTime) {
      const [exifDate, exifTime] = exifDateTime.split(' ');
      const dateWithoutZone = exifDate.replace(/:/g, '-') + 'T' + exifTime;
      const dateWithZone = DateTime.fromISO(dateWithoutZone, {
        zone: 'Europe/Zurich'
      });
      return {
        ...photo,
        date: dateWithZone.toString(),
        width: size.width,
        height: size.height
      };
    }
  }
  return photo;
};

const processLandmark = (landmark, photosPath) => {
  landmark.photos = landmark.photos.map((photo) => extractExif(photo, photosPath));
  return landmark;
};

const processReport = (destination, report) => {
  const reportPath = destination + '/' + report + '/';
  const photosPath = '../static/photos/' + reportPath;
  const file = '../src/reports/' + reportPath + 'report.json';
  const json = jsonfile.readFileSync(file);
  const reportJson = json[0];

  if (reportJson.title3d && (!reportJson.title3d.width || !reportJson.title3d.height)) {
    const size = sizeOf(photosPath + 'title.jpg');
    reportJson.title3d = {
      ...reportJson.title3d,
      width: size.width,
      height: size.height
    };
  }
  reportJson.landmarks = reportJson.landmarks.map((landmark) => processLandmark(landmark, photosPath));

  jsonfile.writeFileSync(file, json, { spaces: 2, flag: 'w' });
};

const processDestination = (destination) => {
  const path = '../src/reports/' + destination;
  const reports = fs.readdirSync(path).filter((f) => fs.statSync(path + '/' + f).isDirectory());
  reports.forEach((report) => processReport(destination, report));
};

const path = '../src/reports';
const destinations = fs.readdirSync(path).filter((f) => fs.statSync(path + '/' + f).isDirectory());
destinations.forEach(processDestination);
