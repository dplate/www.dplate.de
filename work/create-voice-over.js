const textToSpeech = require('@google-cloud/text-to-speech');
const jsonfile = require('jsonfile');
const fs = require('fs');

const projectPath = 'C:/Users/Roger/web/Dp3';
const destination = 'alviergruppe';
const reportDate = '20140907';

const client = new textToSpeech.TextToSpeechClient();

const pronunciations = [
  /*{
    regex: /(alvier)/ig,
    ipa: 'alˈfiːɐ̯'
  }*/
];

const generateAudio = async (rawText, audioFile) => {
  if (fs.existsSync(audioFile)) {
    console.log(audioFile, 'exists, skipping');
    return;
  }

  // Remove silenced texts
  let text = rawText.replace(/(<span data-silent>.*?<\/span>)/gm, '');

  // Remove html tags and replace remaining xml characters
  text = text.replace(/<\/?[^>]+(>|$)/g, '')
    .replaceAll("'", '');

  // Help to pronounce all words correctly
  for (const { regex, ipa} of pronunciations) {
    text = text.replace(regex, `<phoneme alphabet="ipa" ph="${ipa}">$1</phoneme>`)
  }

  // Make sure height is pronounced as units always
  text = text.replace(/(\d+)m/g, `$1 Meter`);

  // Replace smilies
  text = text.replaceAll(':)', '');
  text = text.replaceAll(':-)', '');
  text = text.replaceAll(';)', '');
  text = text.replaceAll(';-)', '');
  text = text.replaceAll('😃', '');

  console.log(audioFile, text, 'synthesizing...');
  const request = {
    input: { ssml: `<speak>${text}</speak>` },
    voice: {
      languageCode: 'de-DE',
      name: 'de-DE-Neural2-H'
    },
    audioConfig: {
      audioEncoding: 'OGG_OPUS'
    },
  };
  const [response] = await client.synthesizeSpeech(request);
  fs.writeFileSync(audioFile, response.audioContent, 'binary');
  console.log(audioFile, 'audio created');
};

const createVoiceOver = async () => {
  const reportPath = projectPath + '/src/reports/' + destination + '/' + reportDate;
  const reportFile = reportPath + '/report.json';
  const voiceOverPath = projectPath + '/static/voiceOver/' + destination + '/' + reportDate;

  const reports = jsonfile.readFileSync(reportFile);
  if (!reports) {
    console.log(reportFile, 'not found');
    return;
  }
  const report = reports[0];
  fs.mkdirSync(voiceOverPath, { recursive: true });

  await generateAudio(report.intro, voiceOverPath + '/intro.ogg');
  for (const [i, landmark] of report.landmarks.entries()) {
    await generateAudio(landmark.text, voiceOverPath + '/' + String('0' + (i + 1)).slice(-2) + '.ogg');
  }
  await generateAudio(report.outro, voiceOverPath + '/outro.ogg');
};

createVoiceOver().catch(console.log);

