import { View, Text, StyleSheet } from "react-native";
import React from "react";
import AppStack from "./src/navigations/AppStack";
import { Colors } from "./src/utils/Colors";

const App = () => {
  return (
    <View style={styles.conatiner}>
      <AppStack />
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  conatiner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
});
