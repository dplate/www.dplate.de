const fs = require('fs');
const tinify = require('tinify');
tinify.key = require('./tinify-key.js');
const exif = require('jpeg-exif');
const sizeOf = require('image-size');
const { DateTime } = require('luxon');

const projectPath = 'C:/Users/Roger/web/Dp3';
const sourcePath = 'D:/Bilder/2024/20241102_sulzfluh';
const destination = 'praettigau';
const reportDate = '20241102';

const newPhoto = async (sourcePhoto, targetPhotosPath, index) => {
  const photoNumber = (index + 1).toLocaleString('en-US', {
    minimumIntegerDigits: 3
  });
  const targetPhoto = targetPhotosPath + '/' + photoNumber + '.jpg';

  if (fs.existsSync(targetPhoto)) {
    console.log(targetPhoto, 'exists');
  } else {
    const source = tinify
      .fromFile(sourcePhoto)
      .resize({
        method: 'fit',
        width: 1920,
        height: 1080
      })
      .preserve('creation', 'location');

    await source.toFile(targetPhoto).catch((error) => {
      console.log(sourcePhoto, targetPhoto, error.message);
      throw 'Photo could not be converted';
    });
    console.log(sourcePhoto, targetPhoto, 'success');
  }

  const photoSize = sizeOf(targetPhoto);
  const exifData = exif.parseSync(targetPhoto);
  // noinspection JSUnresolvedVariable
  const exifDateTime = exifData.SubExif && exifData.SubExif.DateTimeOriginal;
  const [exifDate, exifTime] = exifDateTime.split(' ');
  const dateWithoutZone = exifDate.replace(/:/g, '-') + 'T' + exifTime;
  const dateWithZone = DateTime.fromISO(dateWithoutZone, {
    zone: 'Europe/Zurich'
  });

  return {
    name: photoNumber,
    alt: 'TODO',
    date: dateWithZone.toString(),
    width: photoSize.width,
    height: photoSize.height
  };
};

const createLandmarks = async () => {
  const sourcePhotos = fs
    .readdirSync(sourcePath)
    .filter((file) => file.toLowerCase().endsWith('.jpg'))
    .sort()
    .map((file) => sourcePath + '/' + file);
  const targetPhotosPath = projectPath + '/static/photos/' + destination + '/' + reportDate;
  fs.mkdirSync(targetPhotosPath, { recursive: true });
  const photos = await Promise.all(
    sourcePhotos.map((sourcePhoto, index) => newPhoto(sourcePhoto, targetPhotosPath, index))
  );
  return photos.map((photo) => ({
    photos: [photo],
    text: 'TODO'
  }));
};

const newReport = async () => {
  const reportPath = projectPath + '/src/reports/' + destination + '/' + reportDate;
  const reportFile = reportPath + '/report.json';
  if (fs.existsSync(reportFile)) {
    console.log(reportFile, 'exists');
  } else {
    const report = {
      destination,
      date: 'd' + reportDate,
      type: 'hike',
      track: true,
      detailMap: 'swiss',
      shortTitle: 'TODO',
      title: 'TODO',
      title3d: {
        offsetY: 0,
        fontSize: 8,
        align: 'left',
        width: 1920,
        height: 0
      },
      movie: 'TODO',
      intro: 'TODO',
      landmarks: await createLandmarks(),
      outro: 'TODO'
    };
    fs.mkdirSync(reportPath, { recursive: true });
    fs.writeFileSync(reportFile, JSON.stringify([report], null, 2));
    console.log(reportFile, 'created');
  }
};

const copyTrack = () => {
  const trackPath = projectPath + '/static/tracks/' + destination;
  const trackFileName = reportDate + '.gpx';
  const trackFile = trackPath + '/' + trackFileName;
  if (fs.existsSync(trackFile)) {
    console.log(trackFile, 'exists');
  } else {
    const sourceTrackFile = sourcePath + '/' + trackFileName;
    fs.copyFileSync(sourceTrackFile, trackFile);
    console.log(sourceTrackFile, trackFile, 'copied');
  }
};

const addToSitemap = () => {
  const sitemapFile = projectPath + '/static/sitemap.txt';
  const sitemap = fs.readFileSync(sitemapFile, { encoding: 'UTF-8' });
  const newEntry = 'https://www.dplate.de/alpine/' + destination + '/' + reportDate;
  if (sitemap.includes(newEntry)) {
    console.log(newEntry, 'exists');
  } else {
    const newSitemap = sitemap + '\n' + newEntry;
    fs.writeFileSync(sitemapFile, newSitemap);
    console.log(newEntry, 'added');
  }
};

newReport().catch(console.log);
copyTrack();
addToSitemap();
