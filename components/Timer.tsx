import React, { useEffect, useState } from "react";
import { View, Text, TouchableHighlight } from "react-native";
import { timerStyles } from "../app/styles";
import { Audio } from "expo-av";
import KeepAwake from "react-native-keep-awake";
import ScrollPicker from "react-native-wheel-scrollview-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
const finalBuzzer = require("../assets/audio/mixkit-basketball-buzzer-1647.wav");
const nbaPiano = require("../assets/audio/nba_audio.mp3");
const calvaryString = require("../assets/audio/baseball-calvary-sting-long-sustain-102081.mp3");
const baseballOrgan = require("../assets/audio/baseball-organ-106664.mp3");
const bbClaprhm = require("../assets/audio/bb-claprhm-87606.mp3");

// Array de áudios para tocar aleatoriamente durante o timer
const randomAudios = [calvaryString, baseballOrgan, bbClaprhm];
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
  const [sound, setSound] = useState();
  const [lastTimer, setLastTimer] = useState(["00", "00"]);
  const [isMuteAudio, setIsMuteAudio] = useState(false);
  const [endTimestamp, setEndTimestamp] = useState<number | null>(null);
  const [playedAudioTimes, setPlayedAudioTimes] = useState<Set<number>>(new Set());

  // Carregar dados salvos ao montar o componente
  useEffect(() => {
    loadSavedTimer();
  }, []);

  const loadSavedTimer = async () => {
    try {
      const savedTimer = await AsyncStorage.getItem("lastTimerConfig");
      const savedEndTimestamp = await AsyncStorage.getItem("timerEndTimestamp");
      const savedIsRunning = await AsyncStorage.getItem("timerIsRunning");

      if (savedTimer) {
        const [savedMinutes, savedSeconds] = JSON.parse(savedTimer);
        setLastTimer([savedMinutes, savedSeconds]);

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

  const saveTimerConfig = async (min: string, sec: string) => {
    try {
      await AsyncStorage.setItem("lastTimerConfig", JSON.stringify([min, sec]));
    } catch (error) {
      console.error("Erro ao salvar configuração do timer:", error);
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

          // Tocar som aos 30 segundos (NBA Piano)
          if (totalSeconds === 30) {
            playSound(nbaPiano);
          }

          // Tocar áudios aleatórios em momentos específicos (a cada minuto, exceto no último minuto)
          if (newSeconds === 0 && totalSeconds > 60 && !playedAudioTimes.has(totalSeconds)) {
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
  }, [isTimerStart, endTimestamp, playedAudioTimes]);

  async function playSound(audio: any) {
    if (isMuteAudio === true || !audio) {
      return;
    }

    const { sound } = await Audio.Sound.createAsync(audio);

    setSound(audio);
    await sound.playAsync();
  }

  const handlePickerChange = async (item: string | undefined, type: "minutes" | "seconds") => {
    // the picker may call back with undefined; ignore such calls
    if (item === undefined) return;

    if (!isTimerStart) {
      let newMinutes = minutes;
      let newSeconds = seconds;

      if (type === "minutes") {
        newMinutes = item;
        setMinutes(item);
        setLastTimer([item, seconds]);
      } else if (type === "seconds") {
        newSeconds = item;
        setSeconds(item);
        setLastTimer([minutes, item]);
      }

      // Salvar configuração
      await saveTimerConfig(newMinutes, newSeconds);
    }
  };

  const resetTimer = async () => {
    setIsTimerStart(false);
    setEndTimestamp(null);
    setMinutes(lastTimer[0]);
    setSeconds(lastTimer[1]);
    await AsyncStorage.setItem("timerIsRunning", "false");
    await AsyncStorage.removeItem("timerEndTimestamp");
  };

  const resetTotalTimer = async () => {
    setIsTimerStart(false);
    setEndTimestamp(null);
    setMinutes("00");
    setSeconds("00");
    setLastTimer(["00", "00"]);
    await AsyncStorage.removeItem("lastTimerConfig");
    await AsyncStorage.setItem("timerIsRunning", "false");
    await AsyncStorage.removeItem("timerEndTimestamp");
    resetTimmerComponent();
  };

  const handleFinish = async () => {
    playSound(finalBuzzer);
    setMinutes(lastTimer[0]);
    setSeconds(lastTimer[1]);
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
      await AsyncStorage.setItem("timerIsRunning", "false");
      await AsyncStorage.removeItem("timerEndTimestamp");
    } else {
      // Iniciar o timer
      const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds);
      const endTime = Date.now() + totalSeconds * 1000;

      setEndTimestamp(endTime);
      setIsTimerStart(true);
      setLastTimer([minutes, seconds]);
      setPlayedAudioTimes(new Set()); // Resetar áudios tocados ao iniciar

      // Salvar no AsyncStorage
      await saveTimerConfig(minutes, seconds);
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
              color: minutes === "00" && seconds === "00" ? "white" : "green",
            }}
          >
            {isTimerStart ? "PARAR" : "INICIAR"}
          </Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={() => setIsMuteAudio(!isMuteAudio)}
          style={timerStyles.muteButton}
          disabled={isTimerStart}
        >
          <Text style={timerStyles.muteButtonText}>
            {isMuteAudio ? "🔇" : "🔊"}
          </Text>
        </TouchableHighlight>
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
      </View>
      <KeepAwake />
    </View>
  );
};

export default TimerComponent;
