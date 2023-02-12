const createSound = (audioContext, audioBuffer, loop) => {
  let source = null;

  const gainNode = audioContext.createGain();
  gainNode.connect(audioContext.destination);

  let volume = 1;

  const sound = {
    stop: () => {
      if (source) {
        source.stop();
        source.disconnect();
        source = null;
      }
    },
    setPlaybackRate: (rate) => {
      if (source) {
        source.playbackRate && (source.playbackRate.value = rate);
      }
    },
    setDetune: (detune) => {
      if (source) {
        source.detune && (source.detune.value = detune);
      }
    },
    updateGain: () => {
      if (source) {
        gainNode.gain.value = volume;
      }
    },
    isPlaying: () => Boolean(source)
  };
  sound.play = (restart = false) => {
    if (!source || (restart && sound.stop())) {
      source = audioContext.createBufferSource();
      source.connect(gainNode);
      source.loop = loop;
      source.buffer = audioBuffer;
      source.onended = () => {
        if (source) {
          source.disconnect();
          source = null;
        }
      };
      sound.updateGain();
      source.start();
    }
  };
  sound.setVolume = (newVolume) => {
    if (volume !== newVolume) {
      volume = newVolume;
      sound.updateGain();
    }
  };
  return sound;
};

const setupAudio = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const sounds = [];

  const audio = {
    loadInstanced: async (name) => {
      const response = await fetch('/assets/' + name + '.mp3');
      const buffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(buffer);
      return {
        addInstance: (loop = false) => {
          const sound = createSound(audioContext, audioBuffer, loop);
          sounds.push(sound);
          return sound;
        }
      };
    },
  };
  audio.load = async (name, loop = false) => {
    const instanced = await audio.loadInstanced(name);
    return instanced.addInstance(loop);
  };

  return audio;
};

export default setupAudio;