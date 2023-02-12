import PropTypes from 'prop-types';
import { useEffect, useState, useMemo } from 'react';
import setupAudio from '../../utils/setupAudio';

const MINIMAL_STEP_NOISE_TIME = 10 * 60 * 1000;

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
  const stepNoises = [{
    startPoint: track.points[0],
    sound: null
  }];

  track.points.forEach(point => {
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

const getSpeed = (timestamp, track) => {
  const pointMinuteBefore = track.points.find(point => point.timestamp > (timestamp - 60 * 1000));
  const pointMinuteLater = track.points.findLast(point => point.timestamp < (timestamp + 60 * 1000));
  if (pointMinuteBefore && pointMinuteLater) {
    const distance = pointMinuteLater.distance - pointMinuteBefore.distance;
    const duration = (pointMinuteLater.timestamp - pointMinuteBefore.timestamp);
    if (distance < 1 && duration < 60 * 1000) {
      return 0;
    }
    return distance / duration * 1000;
  }
  return 1.0;
};

const adjustSoundSpeed = (sound, speed) => {
  if (speed < 0.2 || speed > 2.0) {
    sound.setPlaybackRate(0);
    return;
  }
  sound.setPlaybackRate(speed);
  sound.setDetune(Math.log2(1.0 / speed) * 1200);
};

const playStepSound = (timestamp, stepNoises, track) => {
  const speed = getSpeed(timestamp, track);
  const currentStepNoise = stepNoises.find(stepNoise => stepNoise.sound?.isPlaying());
  if (currentStepNoise) {
    adjustSoundSpeed(currentStepNoise.sound, speed);
    return;
  }
  const bestStepNoise = stepNoises.findLast(stepNoise => timestamp > stepNoise.startPoint.timestamp);
  const sound = bestStepNoise?.sound;
  if (sound) {
    sound.play();
    sound.setVolume(0.5);
    adjustSoundSpeed(sound, speed);
  }
};

const muteStepSound = (stepNoises) => {
  const currentStepNoise = stepNoises.find(stepNoise => stepNoise.sound?.isPlaying());
  currentStepNoise?.sound.setPlaybackRate(0);
}

const Soundtrack = ({ phaseName, track, time }) => {
  const timestamp = new Date(time).getTime();

  const [sounds, setSounds] = useState(null);

  useEffect(() => {
    (async () => {
      if (phaseName === 'introScroll' && !sounds) {
        const audio = setupAudio();
        const sounds = {
          arrival: await audio.load('arrival'),
          departure: await audio.load('departure'),
          photo: await audio.load('photo'),
          stepsForest: await audio.load('stepsForest'),
          stepsGrass: await audio.load('stepsGrass'),
          stepsConcrete: await audio.load('stepsConcrete'),
          stepsGravel: await audio.load('stepsGravel'),
          stepsRock: await audio.load('stepsRock'),
          stepsFineGravel: await audio.load('stepsFineGravel')
        };
        setSounds(sounds);
      }
    })();
  }, [phaseName, sounds]);

  const stepNoises = useMemo(() => {
    if (sounds) {
      return calculateStepNoises(track, sounds)
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
  time: PropTypes.string,
};

export default Soundtrack;
