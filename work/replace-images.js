// node ./work/replace-images davos 20151031 2015/20151031_chrüz

const fs = require('fs');
const jsonfile = require('jsonfile');
const gm = require('gm');

const invert  = p  => new Promise((res, rej) => p.then(rej, res));
const firstOf = ps => invert(Promise.all(ps.map(invert)));

const equalityGoal = 0.005;
let runningGmCompares = 0;
const foundMatchings = {};

const doComparision = (imageToCompareAgainst, imageToCompare, resolve, reject) => {
  if (foundMatchings[imageToCompareAgainst]) {
    return reject('no further comparison needed');
  }
  if (Object.keys(foundMatchings).find((foundMatching) => foundMatchings[foundMatching] === imageToCompare)) {
    return reject('already used');
  }
  runningGmCompares ++;
  gm(imageToCompareAgainst).size((error, size) => {
    if (error) {
      reject(error);
    } else {
      const tmpPath = './tmp/' + Math.round(Math.random() * 100000) + '.jpg';
      gm(imageToCompare).resize(size.width, size.height, '!').write(tmpPath, (error) => {
        if (error) {
          reject(error);
        } else {
          gm.compare(imageToCompareAgainst, tmpPath, equalityGoal, (error, isEqual) => {
            runningGmCompares--;
            fs.unlinkSync(tmpPath);
            if (error) {
              reject(error);
            } else if (!isEqual) {
              reject('Not equal enough');
            } else {
              foundMatchings[imageToCompareAgainst] = imageToCompare;
              resolve(imageToCompare);
            }
          });
        }
      });
    }
  });
};

const getEqualityValues = (imageToCompareAgainst, imageToCompare) => {
  return new Promise((resolve, reject) => {
    let timer = null;
    timer = setInterval(() => {
      if (runningGmCompares < 3) {
        clearInterval(timer);
        doComparision(imageToCompareAgainst, imageToCompare, resolve, reject);
      }
    }, 100)
  });
};

const compare = async (imageToCompareAgainst, comparedImages) => {
  const resultPromises = comparedImages.map(getEqualityValues.bind(null, imageToCompareAgainst));
  try {
    return await firstOf(resultPromises);
  } catch(e) {
    console.log(imageToCompareAgainst, 'not found');
    return null;
  }
};

const writeNewPhoto = async (source, destination) => {
  return new Promise((resolve, reject) => {
    gm(source).resize(1920, 1080, '>').write(destination, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

const replacePhotos = async (destination, date, srcPhotosPath, landmarks) => {
  const srcPhotoPaths = [];
  fs.readdirSync(srcPhotosPath).forEach(file => {
    if (file.toLowerCase().endsWith('.jpg')) {
      srcPhotoPaths.push(srcPhotosPath + '/' + file);
    }
  });
  let trackPhotoCounter = 1;

  const landmarkPromises = landmarks.map(async (landmark) => {
    const photoPromises = landmark.photos.map(async (photo) => {
      const oldPhotoPath = './static/photos/' + destination + '/' + date + '/' + photo.name + '.jpg';
      let srcPhotoPath = await compare(oldPhotoPath, srcPhotoPaths);
      let newPhotoName;
      if (srcPhotoPath) {
        newPhotoName = ('00' + (srcPhotoPaths.indexOf(srcPhotoPath) + 1)).substr(-3);
      } else {
        newPhotoName = 'track' + trackPhotoCounter++;
        srcPhotoPath = oldPhotoPath;
      }
      const newPhotoPath = './static/photos/' + destination + '/'+ date + '/' + newPhotoName + '.jpg';
      console.log(srcPhotoPath, newPhotoPath);
      await writeNewPhoto(srcPhotoPath, newPhotoPath);
      return {
        name: newPhotoName,
        alt: photo.alt
      };
    });
    landmark.photos = await Promise.all(photoPromises);
    return landmark;
  });
  return await Promise.all(landmarkPromises);
};

const copyTrack = (destination, date, srcPhotosPath) => {
  const srcTrackFile = srcPhotosPath + '/' + date + '.gpx';
  if (fs.existsSync(srcTrackFile)) {
    const destTrackPath = './static/tracks/' + destination;
    const destTrackFile = destTrackPath + '/' + date + '.gpx';
    try {
      fs.mkdirSync(destTrackPath);
    } catch(e) {
      if (e.code !== 'EEXIST') throw e;
    }
    fs.createReadStream(srcTrackFile).pipe(fs.createWriteStream(destTrackFile));
    return true;
  } else {
    console.log(srcTrackFile, 'does not exist');
    return false;
  }
};

(async function() {
  if (process.argv.length < 5) {
    throw 'Missing required parameters. destination, date and srcPath are required.';
  }
  const destination = process.argv[2];
  const date = process.argv[3];
  const srcPath = process.argv[4];
  const srcPhotosPath = '../../Pictures/' + srcPath;

  const reportFile = './src/reports/' + destination + '/' + date + '/report.json';
  const report = jsonfile.readFileSync(reportFile);

  report[0].landmarks = await replacePhotos(destination, date, srcPhotosPath, report[0].landmarks);
  report[0].track = copyTrack(destination, date, srcPhotosPath);

  jsonfile.writeFileSync(reportFile, report, {spaces: 2, flag: "w"});
})();
