const timecut = require('timecut');

timecut({
  url: 'http://localhost:8000/alpine/alpstein/20201118/movie',
  executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  viewport: {
    width: 1920,
    height: 1080
  },
  width: 1920,
  height: 1080,
  selector: '#movie',
  headless: false,
  startDelay: 1,
  start: 1,
  fps: 60,
  duration: 60,
  screenshotType: 'jpeg',
  pipeMode: true,
  output: 'video.mp4'
}).then(function () {
  console.log('Done!');
});