import React from "react";
import { Text, TouchableHighlight, View } from "react-native";
import { timerStyles } from "../../app/styles";

interface ControlButtonsProps {
  isTimerStart: boolean;
  initialTimer: [string, string] | null;
  minutes: string;
  seconds: string;
  isMuteAudio: boolean;
  onStart: () => void;
  onReset: () => void;
  onTotalReset: () => void;
  onToggleMute: () => void;
}

export const ControlButtons: React.FC<ControlButtonsProps> = ({
  isTimerStart,
  initialTimer,
  minutes,
  seconds,
  isMuteAudio,
  onStart,
  onReset,
  onTotalReset,
  onToggleMute,
}) => {
  const isTimerZero = minutes === "00" && seconds === "00";

  // Verifica se está no tempo inicial (após RESETAR) ou se não há initialTimer
  const isAtInitialTime = !initialTimer || (minutes === initialTimer[0] && seconds === initialTimer[1]);
  const buttonText = isTimerStart ? "PARAR" : (isAtInitialTime ? "INICIAR" : "CONTINUAR");

  return (
    <View style={timerStyles.controlButtons}>
      <TouchableHighlight
        onPress={onStart}
        style={timerStyles.button}
        disabled={isTimerZero}
      >
        <Text
          style={{
            ...timerStyles.buttonText,
            color: isTimerZero ? "white" : (isTimerStart ? "red" : "green"),
          }}
        >
          {buttonText}
        </Text>
      </TouchableHighlight>

      <TouchableHighlight
        onPress={onToggleMute}
        style={timerStyles.muteButton}
        disabled={isTimerStart}
      >
        <Text style={timerStyles.muteButtonText}>
          {isMuteAudio ? "🔇" : "🔊"}
        </Text>
      </TouchableHighlight>

      {!isTimerStart && 
        <>
          <TouchableHighlight
            onPress={onReset}
            style={timerStyles.button}
            disabled={isTimerStart}
          >
            <Text
              style={{
                ...timerStyles.buttonText,
                color: isTimerStart ? "white" : "#FFD700",
              }}
            >
              RESETAR
            </Text>
          </TouchableHighlight>
    
          <TouchableHighlight
            onPress={onTotalReset}
            style={timerStyles.button}
            disabled={isTimerStart}
          >
            <Text
              style={{
                ...timerStyles.buttonText,
                color: isTimerStart ? "white" : "red",
              }}
            >
              ZERAR
            </Text>
          </TouchableHighlight>
        </>
      }
    </View>
  );
};
