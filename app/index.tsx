import React, { useState } from "react";
import { useFonts } from "expo-font";
import { SafeAreaView, StatusBar, Text, View } from "react-native";
import TimerComponent from "../components/Timer";
import { styles } from "./styles";

const App = () => {
  const [isTimerVisible, setIsTimerVisible] = useState(true);
  const [isStopwatchVisible, setIsStopwatchVisible] = useState(false);

  const [fontsLoaded] = useFonts({
    DSEG14Classic: require("../assets/fonts/DSEG14Classic-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }

  const toggleComponent = (componentName: string) => {
    if (componentName === "timer") {
      setIsTimerVisible(true);
      setIsStopwatchVisible(false);
    } else if (componentName === "stopwatch") {
      setIsTimerVisible(false);
      setIsStopwatchVisible(true);
    }
  };

  const resetTimmerComponent = async () => {
    setIsTimerVisible(false);
    await new Promise((resolve) => setTimeout(resolve, 10));
    setIsTimerVisible(true);
    setIsStopwatchVisible(false);
  };

  return (
    <>
      <StatusBar hidden={true} />

      <SafeAreaView style={styles.container}>
        <View style={styles.navigation}>
          {/* <TouchableHighlight
            style={isTimerVisible ? styles.activeButton : styles.inactiveButton}
            onPress={() => toggleComponent("timer")}
          >
            <Text style={styles.buttonText}>TIMER</Text>
          </TouchableHighlight> */}
          {/* <TouchableHighlight
            style={
              isStopwatchVisible ? styles.activeButton : styles.inactiveButton
            }
            onPress={() => toggleComponent("stopwatch")}
          >
            <Text style={styles.buttonText}>CRONOMETER</Text>
          </TouchableHighlight> */}
        </View>
        {isTimerVisible && (
          <TimerComponent resetTimmerComponent={resetTimmerComponent} />
        )}
      </SafeAreaView>
    </>
  );
};

export default App;
