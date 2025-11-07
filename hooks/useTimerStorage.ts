import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useTimerStorage = () => {
  const [initialTimer, setInitialTimer] = useState<[string, string] | null>(null);

  const saveInitialTimerConfig = async (min: string, sec: string) => {
    try {
      await AsyncStorage.setItem("initialTimerConfig", JSON.stringify([min, sec]));
      setInitialTimer([min, sec]);
    } catch (error) {
      console.error("Erro ao salvar configuração inicial do timer:", error);
    }
  };

  const loadSavedTimer = async (): Promise<{
    savedMinutes: string;
    savedSeconds: string;
    isRunning: boolean;
    endTimestamp: number | null;
  }> => {
    try {
      const savedInitialTimer = await AsyncStorage.getItem("initialTimerConfig");
      const savedEndTimestamp = await AsyncStorage.getItem("timerEndTimestamp");
      const savedIsRunning = await AsyncStorage.getItem("timerIsRunning");

      if (savedInitialTimer) {
        const [savedMinutes, savedSeconds] = JSON.parse(savedInitialTimer);
        setInitialTimer([savedMinutes, savedSeconds]);

        // Se o timer estava rodando
        if (savedIsRunning === "true" && savedEndTimestamp) {
          const endTime = parseInt(savedEndTimestamp);
          const now = Date.now();

          if (now < endTime) {
            // Timer ainda está rodando
            const remainingSeconds = Math.ceil((endTime - now) / 1000);
            const newMinutes = Math.floor(remainingSeconds / 60);
            const newSeconds = remainingSeconds % 60;
            return {
              savedMinutes: String(newMinutes).padStart(2, "0"),
              savedSeconds: String(newSeconds).padStart(2, "0"),
              isRunning: true,
              endTimestamp: endTime,
            };
          } else {
            // Timer já terminou enquanto estava em background
            return {
              savedMinutes,
              savedSeconds,
              isRunning: false,
              endTimestamp: null,
            };
          }
        } else {
          return {
            savedMinutes,
            savedSeconds,
            isRunning: false,
            endTimestamp: null,
          };
        }
      }
    } catch (error) {
      console.error("Erro ao carregar timer salvo:", error);
    }

    return {
      savedMinutes: "00",
      savedSeconds: "00",
      isRunning: false,
      endTimestamp: null,
    };
  };

  const clearInitialTimer = async () => {
    try {
      await AsyncStorage.removeItem("initialTimerConfig");
      setInitialTimer(null);
    } catch (error) {
      console.error("Erro ao limpar timer inicial:", error);
    }
  };

  const saveTimerRunningState = async (isRunning: boolean, endTimestamp?: number) => {
    try {
      await AsyncStorage.setItem("timerIsRunning", isRunning ? "true" : "false");
      if (endTimestamp) {
        await AsyncStorage.setItem("timerEndTimestamp", endTimestamp.toString());
      } else {
        await AsyncStorage.removeItem("timerEndTimestamp");
      }
    } catch (error) {
      console.error("Erro ao salvar estado do timer:", error);
    }
  };

  return {
    initialTimer,
    saveInitialTimerConfig,
    loadSavedTimer,
    clearInitialTimer,
    saveTimerRunningState,
  };
};
