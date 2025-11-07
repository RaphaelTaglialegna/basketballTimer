import { useState, useEffect, useRef } from "react";
import { AudioManager } from "../utils/audioManager";
import { AUDIO_FILES, RANDOM_AUDIOS } from "../constants/audioFiles";

export const useAudio = () => {
  const [isMuteAudio, setIsMuteAudio] = useState(false);
  const audioManagerRef = useRef(new AudioManager());
  const [playedAudioTimes, setPlayedAudioTimes] = useState<Set<number>>(new Set());

  useEffect(() => {
    audioManagerRef.current.setMuted(isMuteAudio);
  }, [isMuteAudio]);

  const playSound = async (audio: any, maxDuration?: number) => {
    await audioManagerRef.current.playSound(audio, maxDuration);
  };

  const stopSound = async () => {
    await audioManagerRef.current.stopCurrentSound();
  };

  const playRandomAudio = () => {
    const randomAudio = RANDOM_AUDIOS[Math.floor(Math.random() * RANDOM_AUDIOS.length)];
    playSound(randomAudio);
  };

  const playStartGameAudio = () => {
    playSound(AUDIO_FILES.startGame);
  };

  const playNbaPiano = () => {
    playSound(AUDIO_FILES.nbaPiano);
  };

  const playFinalBuzzer = () => {
    playSound(AUDIO_FILES.finalBuzzer);
  };

  const resetPlayedAudioTimes = () => {
    setPlayedAudioTimes(new Set());
  };

  const addPlayedAudioTime = (time: number) => {
    setPlayedAudioTimes((prev) => new Set(prev).add(time));
  };

  const hasPlayedAtTime = (time: number): boolean => {
    return playedAudioTimes.has(time);
  };

  const toggleMute = () => {
    setIsMuteAudio(!isMuteAudio);
  };

  return {
    isMuteAudio,
    toggleMute,
    playSound,
    stopSound,
    playRandomAudio,
    playStartGameAudio,
    playNbaPiano,
    playFinalBuzzer,
    resetPlayedAudioTimes,
    addPlayedAudioTime,
    hasPlayedAtTime,
  };
};
