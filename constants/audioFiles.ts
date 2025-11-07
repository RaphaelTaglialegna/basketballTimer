// Arquivos de áudio do aplicativo
export const AUDIO_FILES = {
  finalBuzzer: require("../assets/audio/mixkit-basketball-buzzer-1647.wav"),
  nbaPiano: require("../assets/audio/nba_audio.mp3"),
  startGame: require("../assets/audio/start_game.mp3"),
  calvaryString: require("../assets/audio/baseball-calvary-sting-long-sustain-102081.mp3"),
  baseballOrgan: require("../assets/audio/baseball-organ-106664.mp3"),
  bbClaprhm: require("../assets/audio/bb-claprhm-87606.mp3"),
  crossover: require("../assets/audio/crossover-21738.mp3"),
};

// Array de áudios para tocar aleatoriamente durante o timer (a cada 30 segundos)
export const RANDOM_AUDIOS = [
  AUDIO_FILES.calvaryString,
  AUDIO_FILES.baseballOrgan,
  AUDIO_FILES.bbClaprhm,
  AUDIO_FILES.crossover,
];

// Duração máxima de cada áudio em milissegundos
export const MAX_AUDIO_DURATION = 20000; // 20 segundos
