import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    padding: 5,
    width: "100%",
    height: "100%",
    display: "flex",
    backgroundColor: "#000",
  },
  navigation: {
    width: "100%",
    padding: 20,
    backgroundColor: "#000",
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 20,
  },
  componentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E87825",
    width: "100%",
  },
  activeButton: {
    backgroundColor: "#888",
    padding: 5,
    borderRadius: 5,
    marginBottom: 5,
    width: "40%",
  },
  inactiveButton: {
    backgroundColor: "#FFF",
    padding: 5,
    borderRadius: 5,
    marginBottom: 5,
    width: "40%",
  },
  buttonText: {
    fontSize: 20,
    color: "#000",
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    color: "#FFF",
  },
  input: {
    fontSize: 24,
    color: "#FFF",
    marginBottom: 10,
  },
  button: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
    width: 200,
  },
  timerContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "baseline",
    justifyContent: "center",
    backgroundColor: "#000000",
    flexGrow: 1,
  },
  controlButtons: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
});

export const timerOptions = {
  container: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    height: "fit-content",
    flexGrow: 1,
    padding: 20,
  },
  text: {
    fontSize: 20,
    color: "#ffffff",
    fontFamily: "DSEG14Classic",
  },
};

export const timerStyles = StyleSheet.create({
  timerContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "baseline",
    justifyContent: "center",
    backgroundColor: "#000000",
    flexGrow: 1,
  },
  pickerContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    height: "auto",
    padding: 10,
    flexGrow: 1,
  },
  selectedText: {
    fontSize: 210,
    color: "#ffffff",
    fontFamily: "DSEG14Classic",
  },
  colon: {
    fontSize: 190,
    color: "#ffffff",
    fontFamily: "DSEG14Classic",
  },
  button: {
    padding: 10,
    margin: 10,
    backgroundColor: "#333",
    borderRadius: 5,
    width: "20%",
  },
  buttonText: {
    fontSize: 20,
    color: "#FFF",
    textAlign: "center",
  },
  controlButtons: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
});
