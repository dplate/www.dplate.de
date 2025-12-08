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
    isPlaying: () => Boolean(source),
    getDuration: () => audioBuffer.duration
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
    loadInstanced: async (path) => {
      const response = await fetch(path);
      if (!response.ok) {
        return null;
      }
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
  audio.load = async (path) => {
    const instanced = await audio.loadInstanced(path);
    if (!instanced) {
      return null;
    }
    return instanced.addInstance();
  };

  return audio;
};

export default setupAudio;
