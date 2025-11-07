import { useState, useEffect, useRef } from "react";
import { useTimerStorage } from "./useTimerStorage";

interface UseTimerProps {
  resetTimmerComponent: () => void;
  playRandomAudio: () => void;
  playStartGameAudio: () => void;
  playNbaPiano: () => void;
  playFinalBuzzer: () => void;
  stopSound: () => Promise<void>;
  resetPlayedAudioTimes: () => void;
  addPlayedAudioTime: (time: number) => void;
  hasPlayedAtTime: (time: number) => boolean;
}

export const useTimer = ({
  resetTimmerComponent,
  playRandomAudio,
  playStartGameAudio,
  playNbaPiano,
  playFinalBuzzer,
  stopSound,
  resetPlayedAudioTimes,
  addPlayedAudioTime,
  hasPlayedAtTime,
}: UseTimerProps) => {
  const [minutes, setMinutes] = useState("00");
  const [seconds, setSeconds] = useState("00");
  const [isTimerStart, setIsTimerStart] = useState(false);
  const [endTimestamp, setEndTimestamp] = useState<number | null>(null);
  const previousTotalSecondsRef = useRef<number | null>(null);

  const {
    initialTimer,
    saveInitialTimerConfig,
    loadSavedTimer,
    clearInitialTimer,
    saveTimerRunningState,
  } = useTimerStorage();

  // Carregar dados salvos ao montar o componente
  useEffect(() => {
    const loadTimer = async () => {
      const { savedMinutes, savedSeconds, isRunning, endTimestamp } = await loadSavedTimer();
      setMinutes(savedMinutes);
      setSeconds(savedSeconds);
      if (isRunning && endTimestamp) {
        setIsTimerStart(true);
        setEndTimestamp(endTimestamp);
      }
    };
    loadTimer();
  }, []);

  // Loop principal do timer
  useEffect(() => {
    let interval: any = undefined;

    if (isTimerStart && endTimestamp) {
      interval = setInterval(() => {
        const now = Date.now();
        const remainingMs = endTimestamp - now;

        if (remainingMs > 0) {
          const totalSeconds = Math.ceil(remainingMs / 1000);
          const newMinutes = Math.floor(totalSeconds / 60);
          const newSeconds = totalSeconds % 60;

          const currentMinutes = String(newMinutes).padStart(2, "0");
          const currentSeconds = String(newSeconds).padStart(2, "0");

          setMinutes(currentMinutes);
          setSeconds(currentSeconds);

          // Tocar som aos 30 segundos finais (NBA Piano)
          if (totalSeconds === 30 && !hasPlayedAtTime(30)) {
            playNbaPiano();
            addPlayedAudioTime(30);
          }

          // Tocar áudios aleatórios a cada 30 segundos (exceto nos últimos 30 segundos)
          // Verifica se mudou de um tempo que NÃO era múltiplo de 30 para um que É
          const previousSeconds = previousTotalSecondsRef.current;
          if (
            totalSeconds > 30 &&
            totalSeconds % 30 === 0 &&
            previousSeconds !== null &&
            previousSeconds !== totalSeconds &&
            !hasPlayedAtTime(totalSeconds)
          ) {
            playRandomAudio();
            addPlayedAudioTime(totalSeconds);
          }

          previousTotalSecondsRef.current = totalSeconds;
        } else {
          handleFinish();
        }
      }, 100);
    } else if (!isTimerStart && interval) {
      clearInterval(interval);
      previousTotalSecondsRef.current = null;
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerStart, endTimestamp]);

  const handleFinish = async () => {
    playFinalBuzzer();
    if (initialTimer) {
      setMinutes(initialTimer[0]);
      setSeconds(initialTimer[1]);
    }
    setIsTimerStart(false);
    setEndTimestamp(null);
    previousTotalSecondsRef.current = null;
    await saveTimerRunningState(false);
  };

  const handleStart = async () => {
    if (isTimerStart) {
      // Pausar o timer
      setIsTimerStart(false);
      setEndTimestamp(null);
      resetPlayedAudioTimes();
      previousTotalSecondsRef.current = null;
      await stopSound();
      await saveTimerRunningState(false);
    } else {
      // Iniciar ou continuar o timer
      const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds);
      const endTime = Date.now() + totalSeconds * 1000;

      // Se não há tempo inicial salvo, salvar o tempo atual como inicial e tocar música
      if (!initialTimer) {
        await saveInitialTimerConfig(minutes, seconds);
        playStartGameAudio();
      } else if (minutes === initialTimer[0] && seconds === initialTimer[1]) {
        // Se está no tempo inicial (após RESETAR), tocar música também
        playStartGameAudio();
      }
      // Se já tem initialTimer mas não está no tempo inicial, é CONTINUAR - não toca música

      setEndTimestamp(endTime);
      setIsTimerStart(true);
      resetPlayedAudioTimes();
      previousTotalSecondsRef.current = null;
      await saveTimerRunningState(true, endTime);
    }
  };

  const resetTimer = async () => {
    if (initialTimer) {
      setIsTimerStart(false);
      setEndTimestamp(null);
      setMinutes(initialTimer[0]);
      setSeconds(initialTimer[1]);
      resetPlayedAudioTimes();
      previousTotalSecondsRef.current = null;
      await stopSound();
      // NÃO limpa o initialTimer aqui - RESETAR deve manter o tempo inicial
      await saveTimerRunningState(false);
    }
  };

  const resetTotalTimer = async () => {
    setIsTimerStart(false);
    setEndTimestamp(null);
    setMinutes("00");
    setSeconds("00");
    resetPlayedAudioTimes();
    previousTotalSecondsRef.current = null;
    await clearInitialTimer();
    await stopSound();
    await saveTimerRunningState(false);
    resetTimmerComponent();
  };

  const handlePickerChange = (item: string | undefined, type: "minutes" | "seconds") => {
    if (item === undefined || isTimerStart) return;

    if (type === "minutes") {
      setMinutes(item);
    } else if (type === "seconds") {
      setSeconds(item);
    }
  };

  return {
    minutes,
    seconds,
    isTimerStart,
    initialTimer,
    handleStart,
    resetTimer,
    resetTotalTimer,
    handlePickerChange,
  };
};
