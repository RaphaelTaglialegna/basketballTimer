import React, { useState, useEffect } from "react";
import { useFonts } from "expo-font";
import { SafeAreaView, StatusBar, View, Image, StyleSheet } from "react-native";
import TimerComponent from "../components/Timer";
import { styles } from "./styles";

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});

const App = () => {
  const [isTimerVisible, setIsTimerVisible] = useState(true);
  const [isStopwatchVisible, setIsStopwatchVisible] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const [fontsLoaded] = useFonts({
    DSEG14Classic: require("../assets/fonts/DSEG14Classic-Regular.ttf"),
  });

  useEffect(() => {
    async function hideSplash() {
      if (fontsLoaded) {
        // Delay de 3 segundos para mostrar o splash
        await new Promise(resolve => setTimeout(resolve, 3000));
        setShowSplash(false);
      }
    }
    hideSplash();
  }, [fontsLoaded]);

  // Mostrar splash screen customizado
  if (showSplash || !fontsLoaded) {
    return (
      <View style={splashStyles.container}>
        <Image
          source={require("../assets/splash.png")}
          style={splashStyles.image}
          resizeMode="cover"
        />
      </View>
    );
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
