const request = require('request');
const fs = require('fs');
const jsonfile = require('jsonfile');

const noUpperCaseList = [ 'auf', 'im', 'am', 'ins', 'vor', 'durch', 'unter', 'vom', 'vor', 'leere', 'des', 'steile', 'an',
  'mit', 'zum', 'zur', 'von', 'gut', 'in', 'über', 'nach', 'zwischen', 'unterhalb', 'oberhalb', 'der', 'zu', 'und',
  'kleiner', 'den', 'neben', 'alter', 'bei', 'steilem', 'vollem', 'herbstlichen', 'abgestorbenem', 'dem', 'das', 'einer',
  'aus', 'oben', 'unten', 'um', 'hinter', 'aus', 'verschneiter', 'tiefer', 'verschneiten', 'vergrabenes', 'verschneite',
  'vielen'];

const makeWordUpperCase = (word, index) => {
  if (index !== 0 && noUpperCaseList.includes(word)) return word;
  return word.charAt(0).toUpperCase() + word.substr(1);
};

const transformAlt = (alt) => {
  const newAlt = alt.split('-').map(makeWordUpperCase).join(' ');
  return newAlt;
};

const transformPhoto = (photo) => {
  if (photo.name) return photo;
  const parts = photo.split('_');
  if (parts.length === 1) return { name: photo };
  return {
    name: parts[1],
    alt: transformAlt(parts[0])
  }
};

const processLandmark = (landmark) => {
  if (!landmark.photos.length) return landmark;
  landmark.photos = landmark.photos.map(transformPhoto);
  return landmark;
};

const processReport = (destination, report) => {
  const file = './src/reports/' + destination + '/' + report + '/report.json';
  const json = jsonfile.readFileSync(file);
  json[0].landmarks = json[0].landmarks.map(processLandmark);

  jsonfile.writeFileSync(file, json, {spaces: 2, flag: "w"});
};

const processDestination = (destination) => {
  const path = './src/reports/' + destination;
  const reports = fs.readdirSync(path).filter(f => fs.statSync(path+"/"+f).isDirectory());
  reports.forEach(processReport.bind(null, destination));
};

const path = './src/reports';
const destinations = fs.readdirSync(path).filter(f => fs.statSync(path+"/"+f).isDirectory());
destinations.forEach(processDestination);
