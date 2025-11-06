import React, { useEffect, useState } from "react";
import { View, Text, TouchableHighlight } from "react-native";
import { timerStyles } from "../app/styles";
import { Audio } from "expo-av";
// import KeepAwake from "react-native-keep-awake";
import ScrollPicker from "react-native-wheel-scrollview-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
const finalBuzzer = require("../assets/audio/mixkit-basketball-buzzer-1647.wav");
const nbaPiano = require("../assets/audio/nba_audio.mp3");
const startGame = require("../assets/audio/start_game.mp3");
const calvaryString = require("../assets/audio/baseball-calvary-sting-long-sustain-102081.mp3");
const baseballOrgan = require("../assets/audio/baseball-organ-106664.mp3");
const bbClaprhm = require("../assets/audio/bb-claprhm-87606.mp3");
const crossover = require("../assets/audio/crossover-21738.mp3");

// Array de áudios para tocar aleatoriamente durante o timer (a cada 30 segundos)
const randomAudios = [calvaryString, baseballOrgan, bbClaprhm, crossover];
const generatePickerData = (maxValue: number) => {
  return Array.from({ length: maxValue }, (_, index) =>
    String(index).padStart(2, "0")
  );
};

const pickerData = generatePickerData(60);

interface IProps {
  resetTimmerComponent: () => void;
}

const TimerComponent = ({ resetTimmerComponent }: IProps) => {
  const [minutes, setMinutes] = useState("00");
  const [seconds, setSeconds] = useState("00");
  const [isTimerStart, setIsTimerStart] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [initialTimer, setInitialTimer] = useState<[string, string] | null>(null); // Tempo inicial configurado
  const [isMuteAudio, setIsMuteAudio] = useState(false);
  const [endTimestamp, setEndTimestamp] = useState<number | null>(null);
  const [playedAudioTimes, setPlayedAudioTimes] = useState<Set<number>>(new Set());
  const [hasPlayedStartSound, setHasPlayedStartSound] = useState(false);

  // Carregar dados salvos ao montar o componente
  useEffect(() => {
    loadSavedTimer();
  }, []);

  const loadSavedTimer = async () => {
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
            setEndTimestamp(endTime);
            setIsTimerStart(true);
            const remainingSeconds = Math.ceil((endTime - now) / 1000);
            const newMinutes = Math.floor(remainingSeconds / 60);
            const newSeconds = remainingSeconds % 60;
            setMinutes(String(newMinutes).padStart(2, "0"));
            setSeconds(String(newSeconds).padStart(2, "0"));
          } else {
            // Timer já terminou enquanto estava em background
            setMinutes(savedMinutes);
            setSeconds(savedSeconds);
            setIsTimerStart(false);
          }
        } else {
          setMinutes(savedMinutes);
          setSeconds(savedSeconds);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar timer salvo:", error);
    }
  };

  const saveInitialTimerConfig = async (min: string, sec: string) => {
    try {
      await AsyncStorage.setItem("initialTimerConfig", JSON.stringify([min, sec]));
    } catch (error) {
      console.error("Erro ao salvar configuração inicial do timer:", error);
    }
  };

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
          if (totalSeconds === 30) {
            playSound(nbaPiano);
          }

          // Tocar áudios aleatórios a cada 30 segundos (exceto nos últimos 30 segundos)
          if (newSeconds === 0 && totalSeconds > 30 && totalSeconds % 30 === 0 && !playedAudioTimes.has(totalSeconds)) {
            const randomAudio = randomAudios[Math.floor(Math.random() * randomAudios.length)];
            playSound(randomAudio);
            setPlayedAudioTimes(prev => new Set(prev).add(totalSeconds));
          }
        } else {
          handleFinish();
        }
      }, 100); // Atualiza a cada 100ms para maior precisão
    } else if (!isTimerStart && interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerStart, endTimestamp, playedAudioTimes, sound]);

  async function playSound(audio: any, maxDuration: number = 20000) {
    if (isMuteAudio === true || !audio) {
      return;
    }

    try {
      // Parar e descarregar o som anterior, se existir
      if (sound) {
        try {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            if (status.isPlaying) {
              await sound.stopAsync();
            }
            await sound.unloadAsync();
          }
        } catch (error) {
          // Ignorar erro se o som já foi descarregado
          console.log("Som anterior já foi descarregado");
        }
      }

      const { sound: newSound } = await Audio.Sound.createAsync(audio);
      setSound(newSound);
      await newSound.playAsync();

      // Parar o som após a duração máxima (20 segundos)
      setTimeout(async () => {
        try {
          const status = await newSound.getStatusAsync();
          if (status.isLoaded && status.isPlaying) {
            await newSound.stopAsync();
            await newSound.unloadAsync();
          }
        } catch (error) {
          // Ignorar erro se o som já foi descarregado
          console.log("Som já foi descarregado automaticamente");
        }
      }, maxDuration);
    } catch (error) {
      console.error("Erro ao tocar som:", error);
    }
  }

  const handlePickerChange = async (item: string | undefined, type: "minutes" | "seconds") => {
    // the picker may call back with undefined; ignore such calls
    if (item === undefined) return;

    if (!isTimerStart) {
      if (type === "minutes") {
        setMinutes(item);
      } else if (type === "seconds") {
        setSeconds(item);
      }
      // Não salva automaticamente - apenas quando iniciar
    }
  };

  const resetTimer = async () => {
    if (initialTimer) {
      setIsTimerStart(false);
      setEndTimestamp(null);
      setMinutes(initialTimer[0]);
      setSeconds(initialTimer[1]);
      await AsyncStorage.setItem("timerIsRunning", "false");
      await AsyncStorage.removeItem("timerEndTimestamp");
    }
  };

  const resetTotalTimer = async () => {
    setIsTimerStart(false);
    setEndTimestamp(null);
    setMinutes("00");
    setSeconds("00");
    setInitialTimer(null);
    await AsyncStorage.removeItem("initialTimerConfig");
    await AsyncStorage.setItem("timerIsRunning", "false");
    await AsyncStorage.removeItem("timerEndTimestamp");
    resetTimmerComponent();
  };

  const handleFinish = async () => {
    playSound(finalBuzzer);
    if (initialTimer) {
      setMinutes(initialTimer[0]);
      setSeconds(initialTimer[1]);
    }
    setIsTimerStart(false);
    setEndTimestamp(null);
    await AsyncStorage.setItem("timerIsRunning", "false");
    await AsyncStorage.removeItem("timerEndTimestamp");
  };

  const wrapperHeight = 210;
  const itemHeight = 220;

  const handleStart = async () => {
    if (isTimerStart) {
      // Pausar o timer
      setIsTimerStart(false);
      setEndTimestamp(null);
      setPlayedAudioTimes(new Set()); // Resetar áudios tocados
      setHasPlayedStartSound(false); // Resetar flag do som inicial
      await AsyncStorage.setItem("timerIsRunning", "false");
      await AsyncStorage.removeItem("timerEndTimestamp");
    } else {
      // Iniciar ou continuar o timer
      const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds);
      const endTime = Date.now() + totalSeconds * 1000;

      // Se não há tempo inicial salvo, salvar o tempo atual como inicial
      if (!initialTimer) {
        setInitialTimer([minutes, seconds]);
        await saveInitialTimerConfig(minutes, seconds);

        // Tocar som de início apenas quando iniciar pela primeira vez
        playSound(startGame);
        setHasPlayedStartSound(true);
      } else if (!hasPlayedStartSound) {
        // Se está continuando após uma pausa, também tocar o som de início
        playSound(startGame);
        setHasPlayedStartSound(true);
      }

      setEndTimestamp(endTime);
      setIsTimerStart(true);
      setPlayedAudioTimes(new Set()); // Resetar áudios tocados ao iniciar

      // Salvar estado de execução
      await AsyncStorage.setItem("timerIsRunning", "true");
      await AsyncStorage.setItem("timerEndTimestamp", endTime.toString());
    }
  };

  return (
    <View style={timerStyles.timerContainer}>
      {!isTimerStart && (
        <View style={timerStyles.instructionContainer}>
          <Text style={timerStyles.instructionText}>
            Deslize os dedos para ajustar o tempo
          </Text>
        </View>
      )}
      <View style={timerStyles.pickerContainer}>
        {!isTimerStart ? (
          <React.Fragment>
            <ScrollPicker
              dataSource={pickerData} // 0 to 59 for minutes
              selectedIndex={parseInt(minutes)}
              renderItem={(data) => (
                <Text style={timerStyles.selectedText}>{data}</Text>
              )}
              onValueChange={(data) => handlePickerChange(data, "minutes")}
              wrapperHeight={wrapperHeight}
              itemHeight={itemHeight}
              wrapperBackground="#000000"
              key={`minutes-${minutes}`} // Forçar re-render
            />
            <Text style={timerStyles.colon}>:</Text>
            <ScrollPicker
              dataSource={pickerData} // 0 to 59 for seconds
              selectedIndex={parseInt(seconds)}
              renderItem={(data) => (
                <Text style={timerStyles.selectedText}>{data}</Text>
              )}
              onValueChange={(data) => handlePickerChange(data, "seconds")}
              wrapperHeight={wrapperHeight}
              itemHeight={itemHeight}
              wrapperBackground="#000000"
              key={`seconds-${seconds}`} // Forçar re-render
            />
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Text style={timerStyles.timerText}>{minutes}</Text>

            <Text style={timerStyles.colon}>:</Text>

            <Text style={timerStyles.timerText}>{seconds}</Text>
          </React.Fragment>
        )}
      </View>

      <View style={timerStyles.controlButtons}>
        <TouchableHighlight
          onPress={() => handleStart()}
          style={timerStyles.button}
          disabled={minutes === "00" && seconds === "00"}
        >
          <Text
            style={{
              ...timerStyles.buttonText,
              color: minutes === "00" && seconds === "00" ? "white" : (isTimerStart ? "red" : "green"),
            }}
          >
            {isTimerStart ? "PARAR" : (initialTimer ? "CONTINUAR" : "INICIAR")}
          </Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={() => setIsMuteAudio(!isMuteAudio)}
          style={timerStyles.muteButton}
        >
          <Text style={timerStyles.muteButtonText}>
            {isMuteAudio ? "🔇" : "🔊"}
          </Text>
        </TouchableHighlight>
       {!isTimerStart && 
        <>
          <TouchableHighlight
              onPress={() => resetTimer()}
              style={timerStyles.button}
              disabled={isTimerStart}
            >
              <Text style={timerStyles.buttonText}>RESETAR</Text>
            </TouchableHighlight>
            <TouchableHighlight
              onPress={() => resetTotalTimer()}
              style={timerStyles.button}
              disabled={isTimerStart}
            >
              <Text style={timerStyles.buttonText}>ZERAR</Text>
            </TouchableHighlight>
        </>
       }       
      </View>
      {/* <KeepAwake /> */}
    </View>
  );
};

export default TimerComponent;
