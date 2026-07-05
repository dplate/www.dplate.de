const textToSpeech = require('@google-cloud/text-to-speech');
const jsonfile = require('jsonfile');
const fs = require('fs');

const projectPath = 'C:/Users/Roger/web/Dp3';
const destination = 'davos';
const reportDate = '20220702';

const client = new textToSpeech.TextToSpeechClient();

const pronunciations = [
  {
    regex: /(sarsura)/gi,
    replace: 'Sar-SU-ra'
  },
  {
    regex: /(wegabschnitt)/gi,
    replace: 'Weg-Abschnitt'
  },
  {
    regex: /(oberchamm)/gi,
    replace: 'oberkamm'
  },
  {
    regex: /(wegstück)/gi,
    replace: 'Weg-stück'
  },
  {
    regex: /(talende)/gi,
    replace: 'tal-ende'
  },
  {
    regex: /(calfeisen)/gi,
    replace: 'kal-feisen'
  },
  {
    regex: /(gauchach)/gi,
    replace: 'gauch-ach'
  },
  {
    regex: /(chants)/gi,
    ipa: 'tʃants'
  },
  {
    regex: /(ravais-ch)/gi,
    ipa: 'raˈvai̯ʃ'
  },
  {
    regex: /(funtauna)/gi,
    xSampa: 'fun&quot;taUna'
  },
  {
    regex: /(evt\.)/gi,
    replace: 'eventuell'
  },
  {
    regex: /(fanstobels)/gi,
    ipa: 'fanstobəls'
  },
  {
    regex: /(rinderfans)/gi,
    ipa: 'rɪndərfans'
  },
  {
    regex: /(schaffans)/gi,
    ipa: 'ʃaffans'
  },
  {
    regex: /(unbegangen)/gi,
    replace: 'un-begangen'
  },
  {
    regex: /(schilstal)/gi,
    replace: 'Schils-Tal'
  },
  {
    regex: /(gamserrugg)/gi,
    ipa: 'ˈɡamsərʊk'
  },
  {
    regex: /(fähneren)/gi,
    ipa: 'ˈfɛɛnərən'
  },
  {
    regex: /(alpenrösli)/gi,
    replace: 'Alpen-röes-li'
  },
  {
    regex: /(alpstraßen)/gi,
    ipa: 'ˈalpˌʃtʁaːsən'
  },
  {
    regex: /[^>](alpstraße)/gi,
    ipa: 'ˈalpˌʃtʁaːsə'
  },
  {
    regex: /(cuncels)/gi,
    ipa: 'ˈkʊntʃɛls'
  },
  {
    regex: /\s(chlus)/gi,
    ipa: 'xlus'
  },
  {
    regex: /(mad)/gi,
    ipa: 'ˈmaːt'
  },
  {
    regex: /(madchopf)/gi,
    ipa: 'ˈmaːtˌkɔpf'
  },
  {
    regex: /(burst)/gi,
    ipa: 'burst'
  },
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
    regex: /(chäserruggs)/gi,
    ipa: 'ˈχɛɛzərʊks'
  },
  {
    regex: /[^>](chäserrugg)/gi,
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
    regex: /(kamors)/gi,
    ipa: 'ˈkaamors'
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
  for (const { regex, ipa, xSampa, replace } of pronunciations) {
    if (replace) {
      text = text.replace(regex, replace);
    }
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
