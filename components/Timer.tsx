import React from "react";
import { Text, View } from "react-native";
import KeepAwake from "react-native-keep-awake";
import { timerStyles } from "../app/styles";
import { useTimer } from "../hooks/useTimer";
import { useAudio } from "../hooks/useAudio";
import { TimerDisplay } from "./timer/TimerDisplay";
import { TimerPicker } from "./timer/TimerPicker";
import { ControlButtons } from "./timer/ControlButtons";

interface IProps {
  resetTimmerComponent: () => void;
}

const TimerComponent = ({ resetTimmerComponent }: IProps) => {
  const {
    isMuteAudio,
    toggleMute,
    playRandomAudio,
    playStartGameAudio,
    playNbaPiano,
    playFinalBuzzer,
    stopSound,
    resetPlayedAudioTimes,
    addPlayedAudioTime,
    hasPlayedAtTime,
  } = useAudio();

  const {
    minutes,
    seconds,
    isTimerStart,
    initialTimer,
    handleStart,
    resetTimer,
    resetTotalTimer,
    handlePickerChange,
  } = useTimer({
    resetTimmerComponent,
    playRandomAudio,
    playStartGameAudio,
    playNbaPiano,
    playFinalBuzzer,
    stopSound,
    resetPlayedAudioTimes,
    addPlayedAudioTime,
    hasPlayedAtTime,
  });

  return (
    <View style={timerStyles.timerContainer}>
      {!isTimerStart && (
        <View style={{ paddingHorizontal: 20, alignItems: 'center', width: '100%' }}>
          <Text style={timerStyles.instructionText}>
            Deslize os dedos sobre os números para cima ou para baixo para ajustar o tempo
          </Text>
          <Text style={timerStyles.instructionText}>
            Para ajustar um novo tempo zere o timer primeiro
          </Text>
        </View>
      )}

      <View style={timerStyles.pickerContainer}>
        {!isTimerStart ? (
          <TimerPicker
            minutes={minutes}
            seconds={seconds}
            onPickerChange={handlePickerChange}
          />
        ) : (
          <TimerDisplay minutes={minutes} seconds={seconds} />
        )}
      </View>

      <ControlButtons
        isTimerStart={isTimerStart}
        initialTimer={initialTimer}
        minutes={minutes}
        seconds={seconds}
        isMuteAudio={isMuteAudio}
        onStart={handleStart}
        onReset={resetTimer}
        onTotalReset={resetTotalTimer}
        onToggleMute={toggleMute}
      />
      <KeepAwake />
    </View>
  );
};

export default TimerComponent;
