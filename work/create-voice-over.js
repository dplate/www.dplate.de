const textToSpeech = require('@google-cloud/text-to-speech');
const jsonfile = require('jsonfile');
const fs = require('fs');

const projectPath = 'C:/Users/Roger/web/Dp3';
const destination = 'montafon';
const reportDate = '20191026';

const client = new textToSpeech.TextToSpeechClient();

const pronunciations = [
  {
    regex: /(blackter)/gi,
    ipa: 'ˈblaktɐ'
  },
  {
    regex: /(fideriser)/gi,
    ipa: 'fiːdəˈʁiːzɐ'
  },
  {
    regex: /(faniner)/gi,
    ipa: 'faˈniːnɐ'
  },
  {
    regex: /(partnun)/gi,
    ipa: 'ˈpartnʊn'
  },
  {
    regex: /(Uf da Flüe)/gi,
    ipa: 'ʊf da flyə'
  },
  {
    regex: /(Uf da Flüe)/gi,
    ipa: 'ʊf da flyə'
  },
  {
    regex: /(avers)/gi,
    ipa: 'aˈvɛrs'
  },
  {
    regex: /(jenisberg)/gi,
    xSampa: 'jEnIsbErk'
  },
  {
    regex: /(monstein)/gi,
    xSampa: 'mOnStaIn'
  },
  {
    regex: /(garselli)/gi,
    ipa: 'gaːʁzəlɪ'
  },
  {
    regex: /(kuegrats)/gi,
    ipa: 'kygrats'
  },
  {
    regex: /[^>](kuegrat)/gi,
    ipa: 'kygrat'
  },
  {
    regex: /(gaflei)/gi,
    ipa: 'gaːflaɪ'
  },
  {
    regex: /(girenspitz)/gi,
    ipa: 'ˈɡiːrənˌʃpɪts'
  },
  {
    regex: /(buchs)/gi,
    ipa: 'bʊks'
  },
  {
    regex: /(titlis)/gi,
    ipa: 'ˈtiːtlɪs'
  },
  {
    regex: /(selun)/gi,
    ipa: 'selun'
  },
  {
    regex: /(isizer)/gi,
    ipa: 'ˈiːsɪtsɐ'
  },
  {
    regex: /(chapf)/gi,
    ipa: 'xapf'
  },
  {
    regex: /(chopfs)/gi,
    ipa: 'kɔpfs'
  },
  {
    regex: /(chopf)/gi,
    ipa: 'kɔpf'
  },
  {
    regex: /(carschina)/gi,
    ipa: 'ˌkaˈʃiːna'
  },
  {
    regex: /(schijen)/gi,
    ipa: 'ʃiːjɛŋ'
  },
  {
    regex: /(pischa)/gi,
    ipa: 'pɪʃaː'
  },
  {
    regex: /(vereina)/gi,
    ipa: 'ˈvɛˈʁaɪna'
  },
  {
    regex: /(espel)/gi,
    ipa: 'ˈɛzpɛl'
  },
  {
    regex: /(chäserrugg)/gi,
    ipa: 'ˈχɛɛzərʊk'
  },
  {
    regex: /(hinterruggs)/gi,
    ipa: 'hɪntərʊks'
  },
  {
    regex: /[^>](hinterrugg)/gi,
    ipa: 'hɪntərʊk'
  },
  {
    regex: /(sämtisersee)/gi,
    ipa: 'ˈzɛmtɪzɐˌzee'
  },
  {
    regex: /(fälensee)/gi,
    ipa: 'ˈfɛɛlənˌzee'
  },
  {
    regex: /(brülisau)/gi,
    ipa: 'ˈbrylɪs.aʊ'
  },
  {
    regex: /(kamor)/gi,
    ipa: 'ˈkaamor'
  },
  {
    regex: /(schäflers)/gi,
    ipa: 'ʃɛɛflərs'
  },
  {
    regex: /(windegga)/gi,
    ipa: 'ˈvɪnd.ɛɛga.'
  },
  {
    regex: /(mutschen)/gi,
    ipa: 'ˈmʊtʃn̩'
  },
  {
    regex: /(spicher)/gi,
    ipa: 'ˈʃpiːçɐ'
  },
  {
    regex: /(Hinweg)/g,
    ipa: 'ˈhɪnvek'
  },
  {
    regex: /(zervrei)/gi,
    ipa: 'tsɛrˈfraɪ̯'
  },
  {
    regex: /(canal)/gi,
    ipa: 'kanal'
  },
  {
    regex: /(rappenstein)/gi,
    ipa: 'ˈʁapn̩ʃtaɪn'
  },
  {
    regex: /(dischmatal)/gi,
    ipa: 'ˈdɪʃmaˌtaːl'
  },
  {
    regex: /(walser)/gi,
    ipa: 'ˈval.zɐ'
  },
  {
    regex: /(sapün)/gi,
    ipa: 'saˈpyn'
  },
  {
    regex: /(cassons)/gi,
    ipa: 'kaˈsɔns'
  },
  {
    regex: /(brienz)/gi,
    ipa: 'briːənts'
  },
  {
    regex: /(gauschla)/gi,
    ipa: 'gauʃla'
  }
];

const generateAudio = async (rawText, audioFile) => {
  if (fs.existsSync(audioFile)) {
    console.log(audioFile, 'exists, skipping');
    return;
  }

  // Remove silenced texts
  let text = rawText.replace(/(<span data-silent>.*?<\/span>)/gm, '');

  // Remove html tags and replace remaining xml characters
  text = text.replace(/<\/?[^>]+(>|$)/g, ' ').replaceAll("'", '');

  // Help to pronounce all words correctly
  for (const { regex, ipa, xSampa } of pronunciations) {
    const alphabet = xSampa ? 'x-sampa' : 'ipa';
    const phoneme = xSampa || ipa;
    text = text.replace(regex, `<phoneme alphabet="${alphabet}" ph="${phoneme}">$1</phoneme>`);
  }

  // Make sure height is pronounced as units always
  text = text.replace(/(\d+)m([^\w])/g, `$1 Meter$2`);

  // Make sure time is pronounced as units always
  text = text.replace(/1h/g, `eine Stunde`);
  text = text.replace(/(\d+)h/g, `$1 Stunden`);

  // Replace smilies
  text = text.replaceAll(':)', '');
  text = text.replaceAll(':-)', '');
  text = text.replaceAll(';)', '');
  text = text.replaceAll(':(', '');
  text = text.replaceAll(';-)', '');
  text = text.replaceAll('😃', '');
  text = text.replaceAll('😉', '');

  console.log(audioFile, text, 'synthesizing...');
  const request = {
    input: { ssml: `<speak>${text}</speak>` },
    voice: {
      languageCode: 'de-DE',
      name: 'de-DE-Neural2-H'
    },
    audioConfig: {
      audioEncoding: 'OGG_OPUS'
    }
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
