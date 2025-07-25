import PropTypes from 'prop-types';
import { useRef } from 'react';
import { useEffect, useState, useMemo } from 'react';

const MINIMAL_STEP_NOISE_TIME = 10 * 60 * 1000;

const environmentNoises = [
  {
    name: 'tweet1',
    minHeight: 0,
    mainHeight: 900,
    maxHeight: 1800,
    probability: 0.1
  },
  {
    name: 'tweet2',
    minHeight: 0,
    mainHeight: 1000,
    maxHeight: 1700,
    probability: 0.1
  },
  {
    name: 'tweet3',
    minHeight: 0,
    mainHeight: 800,
    maxHeight: 1800,
    probability: 0.1
  },
  {
    name: 'tweet4',
    minHeight: 0,
    mainHeight: 900,
    maxHeight: 1900,
    probability: 0.1
  },
  {
    name: 'cuckoo',
    minHeight: 0,
    mainHeight: 600,
    maxHeight: 1300,
    probability: 0.03
  },
  {
    name: 'woodpecker',
    minHeight: 0,
    mainHeight: 1200,
    maxHeight: 2000,
    probability: 0.02
  },
  {
    name: 'chainsaw',
    minHeight: 1000,
    mainHeight: 1500,
    maxHeight: 1800,
    probability: 0.005
  },
  {
    name: 'bark1',
    minHeight: 800,
    mainHeight: 900,
    maxHeight: 2000,
    probability: 0.01
  },
  {
    name: 'bark2',
    minHeight: 700,
    mainHeight: 900,
    maxHeight: 2000,
    probability: 0.01
  },
  {
    name: 'bark3',
    minHeight: 700,
    mainHeight: 900,
    maxHeight: 2100,
    probability: 0.01
  },
  {
    name: 'cowbell1',
    minHeight: 0,
    mainHeight: 1500,
    maxHeight: 2200,
    probability: 0.01
  },
  {
    name: 'cowbell2',
    minHeight: 0,
    mainHeight: 1300,
    maxHeight: 2000,
    probability: 0.01
  },
  {
    name: 'cowbell3',
    minHeight: 0,
    mainHeight: 1400,
    maxHeight: 2100,
    probability: 0.01
  },
  {
    name: 'moo',
    minHeight: 0,
    mainHeight: 1400,
    maxHeight: 2100,
    probability: 0.005
  },
  {
    name: 'chirp1',
    minHeight: 1400,
    mainHeight: 1800,
    maxHeight: 2600,
    probability: 0.07
  },
  {
    name: 'chirp2',
    minHeight: 1300,
    mainHeight: 1800,
    maxHeight: 2600,
    probability: 0.07
  },
  {
    name: 'chirp3',
    minHeight: 1400,
    mainHeight: 1800,
    maxHeight: 2600,
    probability: 0.07
  },
  {
    name: 'marmot',
    minHeight: 1200,
    mainHeight: 1800,
    maxHeight: 3000,
    probability: 0.02
  },
  {
    name: 'stones',
    minHeight: 2000,
    mainHeight: 2500,
    maxHeight: 5000,
    probability: 0.02
  },
  {
    name: 'wind1',
    minHeight: 2100,
    mainHeight: 2500,
    maxHeight: 5000,
    probability: 0.01
  },
  {
    name: 'wind2',
    minHeight: 1900,
    mainHeight: 2500,
    maxHeight: 5000,
    probability: 0.01
  },
  {
    name: 'wind3',
    minHeight: 2000,
    mainHeight: 2500,
    maxHeight: 5000,
    probability: 0.01
  },
  {
    name: 'helicopter',
    minHeight: 1800,
    mainHeight: 2500,
    maxHeight: 5000,
    probability: 0.002
  },
  {
    name: 'bleat',
    minHeight: 1200,
    mainHeight: 2000,
    maxHeight: 2500,
    probability: 0.01
  },
  {
    name: 'goatbell',
    minHeight: 1200,
    mainHeight: 2000,
    maxHeight: 2500,
    probability: 0.02
  },
  {
    name: 'bee',
    minHeight: 600,
    mainHeight: 1000,
    maxHeight: 2500,
    probability: 0.02
  },
  {
    name: 'eagle',
    minHeight: 1800,
    mainHeight: 2500,
    maxHeight: 5000,
    probability: 0.01
  }
];

const findStepSound = (sounds, height) => {
  const possibleSounds = [];
  if (height < 1700) {
    possibleSounds.push(sounds.stepsForest);
  }
  if (height < 2000) {
    possibleSounds.push(sounds.stepsGrass);
  }
  if (height < 1000) {
    possibleSounds.push(sounds.stepsConcrete);
  }
  if (height > 1500) {
    possibleSounds.push(sounds.stepsGravel);
  }
  if (height > 2000) {
    possibleSounds.push(sounds.stepsRock);
  }
  if (height > 1800) {
    possibleSounds.push(sounds.stepsFineGravel);
  }
  return possibleSounds[Math.floor(Math.random() * possibleSounds.length)];
};

const calculateStepNoises = (track, sounds) => {
  const stepNoises = [
    {
      startPoint: track.points[0],
      sound: null
    }
  ];

  track.points.forEach((point) => {
    const currenStepNoise = stepNoises[stepNoises.length - 1];
    const durationOfCurrentStep = point.timestamp - currenStepNoise.startPoint.timestamp;
    if (!currenStepNoise.sound || durationOfCurrentStep > MINIMAL_STEP_NOISE_TIME) {
      stepNoises.push({
        startPoint: point,
        sound: findStepSound(sounds, point.height)
      });
    }
  });

  return stepNoises;
};

const getPoint = (timestamp, track) => track.points.findLast((point) => point.timestamp < timestamp);

const getHeight = (timestamp, track) => {
  const point = track.points.find((point) => point.timestamp > timestamp);
  if (!point) {
    return track.points[track.points.length - 1].height;
  }
  return point.height;
};

const adjustSoundSpeed = (sound, point) => {
  if (point.action !== 'walking') {
    sound.setPlaybackRate(0);
    return;
  }
  sound.setPlaybackRate(point.distanceSpeed);
  sound.setDetune(Math.log2(1.0 / point.distanceSpeed) * 1200);
};

const playStepSound = (timestamp, stepNoises, track) => {
  const point = getPoint(timestamp, track);
  const currentStepNoise = stepNoises.find((stepNoise) => stepNoise.sound?.isPlaying());
  if (currentStepNoise) {
    adjustSoundSpeed(currentStepNoise.sound, point);
    return;
  }
  const bestStepNoise = stepNoises.findLast((stepNoise) => timestamp > stepNoise.startPoint.timestamp);
  const sound = bestStepNoise?.sound;
  if (sound) {
    sound.play();
    sound.setGain(0.7);
    adjustSoundSpeed(sound, point);
  }
};

const muteStepSound = (stepNoises) => {
  const currentStepNoise = stepNoises.find((stepNoise) => stepNoise.sound?.isPlaying());
  currentStepNoise?.sound.setPlaybackRate(0);
};

const playEnvironmentSounds = (height, sounds) => {
  environmentNoises.forEach((environmentNoise) => {
    if (height > environmentNoise.minHeight && height < environmentNoise.maxHeight) {
      const heightFactor =
        height > environmentNoise.mainHeight
          ? (environmentNoise.maxHeight - height) / (environmentNoise.maxHeight - environmentNoise.mainHeight)
          : (height - environmentNoise.minHeight) / (environmentNoise.mainHeight - environmentNoise.minHeight);
      if (Math.random() < environmentNoise.probability * heightFactor) {
        const sound = sounds[environmentNoise.name].addInstance();
        const gain = Math.pow(Math.random(), 4);
        const pan = Math.random() * 2 - 1;
        sound.play();
        sound.setGain(gain);
        sound.setPan(pan);
      }
    }
  });
};

const Soundtrack = ({ audio, phaseName, track, time }) => {
  const timestamp = new Date(time).getTime();

  const [sounds, setSounds] = useState(null);

  const height = useRef(null);
  useEffect(() => {
    if (timestamp && track) {
      height.current = getHeight(timestamp, track);
    }
  }, [timestamp, track]);

  useEffect(() => {
    (async () => {
      if (phaseName === 'introScroll' && !sounds) {
        const sounds = {
          arrival: await audio.load('/assets/sounds/arrival.mp3'),
          departure: await audio.load('/assets/sounds/departure.mp3'),
          photo: await audio.load('/assets/sounds/photo.mp3'),
          stepsForest: await audio.load('/assets/sounds/stepsForest.mp3'),
          stepsGrass: await audio.load('/assets/sounds/stepsGrass.mp3'),
          stepsConcrete: await audio.load('/assets/sounds/stepsConcrete.mp3'),
          stepsGravel: await audio.load('/assets/sounds/stepsGravel.mp3'),
          stepsRock: await audio.load('/assets/sounds/stepsRock.mp3'),
          stepsFineGravel: await audio.load('/assets/sounds/stepsFineGravel.mp3')
        };
        await Promise.all(
          environmentNoises.map(async (environmentNoise) => {
            sounds[environmentNoise.name] = await audio.loadInstanced(`/assets/sounds/${environmentNoise.name}.mp3`);
          })
        );
        setSounds(sounds);
      }
    })();
  }, [audio, phaseName, sounds]);

  const stepNoises = useMemo(() => {
    if (sounds) {
      return calculateStepNoises(track, sounds);
    }
    return null;
  }, [track, sounds]);

  useEffect(() => {
    if (sounds && timestamp && stepNoises && track) {
      switch (phaseName) {
        case 'introScroll':
          sounds.arrival.play();
          break;
        case 'map':
          playStepSound(timestamp, stepNoises, track);
          break;
        case 'photo':
          muteStepSound(stepNoises);
          sounds.photo.play();
          break;
        case 'outro':
          muteStepSound(stepNoises);
          sounds.departure.play();
          break;
        default:
      }
    }
  }, [phaseName, sounds, timestamp, stepNoises, track]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (height.current && sounds) {
        playEnvironmentSounds(height.current, sounds);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [height, sounds]);

  return null;
};

Soundtrack.propTypes = {
  phaseName: PropTypes.string.isRequired,
  track: PropTypes.shape({
    points: PropTypes.arrayOf(
      PropTypes.shape({
        timestamp: PropTypes.number.isRequired,
        distance: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired
      })
    ).isRequired
  }).isRequired,
  time: PropTypes.string
};

export default Soundtrack;
