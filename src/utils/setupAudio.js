const createSound = (audioContext, audioBuffer) => {
  let source = null;

  const panNode = audioContext.createStereoPanner();
  panNode.connect(audioContext.destination);
  const gainNode = audioContext.createGain();
  gainNode.connect(panNode);

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
    setPan: (pan) => {
      if (source) {
        panNode.pan.value = pan;
      }
    },
    setGain: (gain) => {
      if (source) {
        gainNode.gain.value = gain;
      }
    },
    isPlaying: () => Boolean(source)
  };
  sound.play = (restart = false) => {
    if (!source || (restart && sound.stop())) {
      source = audioContext.createBufferSource();
      source.connect(gainNode);
      source.buffer = audioBuffer;
      source.onended = () => {
        if (source) {
          source.disconnect();
          source = null;
        }
      };
      source.start();
    }
  };
  return sound;
};

const setupAudio = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const sounds = [];

  const audio = {
    loadInstanced: async (name) => {
      const response = await fetch('/assets/sounds/' + name + '.mp3');
      const buffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(buffer);
      return {
        addInstance: () => {
          const sound = createSound(audioContext, audioBuffer);
          sounds.push(sound);
          return sound;
        }
      };
    }
  };
  audio.load = async (name) => {
    const instanced = await audio.loadInstanced(name);
    return instanced.addInstance();
  };

  return audio;
};

export default setupAudio;
