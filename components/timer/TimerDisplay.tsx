import React from "react";
import { Text, View } from "react-native";
import { timerStyles } from "../../app/styles";

interface TimerDisplayProps {
  minutes: string;
  seconds: string;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ minutes, seconds }) => {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Text style={timerStyles.timerText}>{minutes}</Text>
      <Text style={timerStyles.colon}>:</Text>
      <Text style={timerStyles.timerText}>{seconds}</Text>
    </View>
  );
};
