import React from "react";
import { Text } from "react-native";
import ScrollPicker from "react-native-wheel-scrollview-picker";
import { timerStyles } from "../../app/styles";

const generatePickerData = (maxValue: number) => {
  return Array.from({ length: maxValue }, (_, index) =>
    String(index).padStart(2, "0")
  );
};

const pickerData = generatePickerData(60);
const wrapperHeight = 210;
const itemHeight = 220;

interface TimerPickerProps {
  minutes: string;
  seconds: string;
  onPickerChange: (item: string | undefined, type: "minutes" | "seconds") => void;
}

export const TimerPicker: React.FC<TimerPickerProps> = ({ minutes, seconds, onPickerChange }) => {
  return (
    <>
      <ScrollPicker
        dataSource={pickerData}
        selectedIndex={parseInt(minutes)}
        renderItem={(data) => (
          <Text style={timerStyles.selectedText}>{data}</Text>
        )}
        onValueChange={(data) => onPickerChange(data, "minutes")}
        wrapperHeight={wrapperHeight}
        itemHeight={itemHeight}
        wrapperBackground="#000000"
        key={`minutes-${minutes}`}
      />
      <Text style={timerStyles.colon}>:</Text>
      <ScrollPicker
        dataSource={pickerData}
        selectedIndex={parseInt(seconds)}
        renderItem={(data) => (
          <Text style={timerStyles.selectedText}>{data}</Text>
        )}
        onValueChange={(data) => onPickerChange(data, "seconds")}
        wrapperHeight={wrapperHeight}
        itemHeight={itemHeight}
        wrapperBackground="#000000"
        key={`seconds-${seconds}`}
      />
    </>
  );
};
