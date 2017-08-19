const request = require('request');
const fs = require('fs');
const jsonfile = require('jsonfile');

const extractTitle = (firstCard) => {
  const regex = /<h1>(.*)-.*<\/h1>/;
  match = regex.exec(firstCard);
  return match[1].trim();
};

const extractIntro = (firstCard) => {
  const regex = /<\/h1>([\s\S]*)/;
  match = regex.exec(firstCard);
  return match[1].trim();
};

const savePhoto = (destination, date, photo) => {
  const src = './static2/photos/' + photo + '.jpg';
  const path = './static/photos/' + destination + '/' + date;
  const dest = path + '/' + photo + '.jpg';
  try {
    fs.mkdirSync(path);
  } catch(e) {
    if (e.code !== 'EEXIST') throw e;
  }
  try {
    fs.renameSync(src, dest)
  } catch(e) {
    if (e.code !== 'EEXIST' && e.code !== 'ENOENT') throw e;
  }
};

const extractPhotos = (destination, date, card) => {
  const photos = [];
  let match;
  const regexWithAlt = /<img.*?src="\/photos\/(.*?).jpg".*?alt="(.*?)"/g;
  while ((match = regexWithAlt.exec(card)) !== null) {
    const seo = match[2].replace(/ /g, "-").toLowerCase();
    savePhoto(destination, date, match[1]);
    photos.push(seo + '_' + match[1]);
  }
  if (photos.length > 0) return photos;

  const regex = /<img.*?src="\/photos\/(.*?).jpg"/g;
  while ((match = regex.exec(card)) !== null) {
    if (match[1].startsWith(destination + '/' + date + '/')) {
      const photo = match[1].replace(destination + '/' + date + '/', '');
      photos.push(photo);
    } else {
      savePhoto(destination, date, match[1]);
      photos.push(match[1]);
    }
  }
  return photos;
};

const extractVideos = (card) => {
  const videos = [];
  let match;
  const regex = /<video.*?src="(.*?)"/g;
  while ((match = regex.exec(card)) !== null) {
    videos.push(match[1]);
  }
  return videos;
};

const extractText = (card) => {
  const regex = /[\s\S]*\/><br \/>([\s\S]*)/g;
  match = regex.exec(card);
  return match[1].trim();
};

const extractLandmark = (destination, date, card) => {
  const photos = extractPhotos(destination, date, card);
  const videos = extractVideos(card);
  const text = (photos.length > 0 || videos.length > 0) ? extractText(card) : card.trim();
  return { photos, videos, text };
};

const saveReport = (overwrite, reportJson) => {
  const path = './src/reports/' + reportJson[0].destination + '/' + reportJson[0].date;
  const file = path + '/report.json';
  const exists = fs.existsSync(file);
  if (!overwrite && exists) return false;
  try {
    fs.mkdirSync(path);
  } catch(e) {
    if (e.code !== 'EEXIST') throw e;
  }
  jsonfile.writeFileSync(file, reportJson, {spaces: 2, flag: overwrite ? "w" : "wx"});
  return !exists;
};

const processReport = (overwrite, destination, report) => {
  if (report.name === '20170801' || report.name === '20170716') return;
  let html = fs.readFileSync( '../Dp2/src/pages/alpine/' + destination.name + '/' + report.name + '.html', 'utf8');
  html = html.replace(/(<div class="videoWrapper">)[\S\s]*?embed\/(.*)\?[\S\s]*?(<\/div>)/g, '<video src="$2" /><br \/>');

  const regex = /<div.*>([\S\s]*?)<\/div>/g;
  let cards = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    cards.push(match[1]);
  }

  const title = extractTitle(cards[0]);
  let intro = extractIntro(cards[0]);
  cards = cards.slice(1);
  const landmarks = [];
  let outro = '';
  cards.forEach((card, index) => {
    const landmark = extractLandmark(destination.name, report.name, card);
    if (landmark.photos.length === 0 && landmark.videos.length === 0) {
      if (index < cards.length - 1) {
        if (landmarks.length !== 0) {
          landmarks[landmarks.length - 1].text += '<br />' + landmark.text;
        } else {
          intro += '<br />' + landmark.text
        }
      } else {
        outro = landmark.text
      }
    } else {
      landmarks.push(landmark);
    }
  });

  const reportJson = [{
    destination: destination.name,
    date: report.name,
    track: false,
    shortTitle: report.subLabel,
    title,
    intro,
    landmarks,
    outro
  }];
  if (saveReport(overwrite, reportJson)) throw 'success';
};

const processDestination = (overwrite, destination) => {
  destination.subs.forEach(processReport.bind(null, overwrite, destination));
};

const overwrite = (process.argv[2] === 'overwrite');
const items = jsonfile.readFileSync('../Dp2/res/items.json');
const alpine = items.find((item) => item.name === 'alpine');
alpine.subs.forEach(processDestination.bind(null, overwrite));
