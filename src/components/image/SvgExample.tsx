import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Animal, animalNames, getRandomAnimalComponent } from "./animals";

// Example of how to use SVGs in your React Native app
export const SvgExample: React.FC = () => {
  const randomAnimal = getRandomAnimalComponent();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SVG Examples</Text>

      {/* Basic usage with default size */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Animal SVG (50x50)</Text>
        <Animal name="bird" />
      </View>

      {/* Custom size */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Custom Size (100x100)</Text>
        <Animal name="lion" width={100} height={100} />
      </View>

      {/* With custom colors */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Custom Colors</Text>
        <Animal
          name="owl"
          width={80}
          height={80}
          fill="#FF6B6B"
          stroke="#4ECDC4"
          strokeWidth={2}
        />
      </View>

      {/* Random animal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Random Animal: {randomAnimal.name}
        </Text>
        <randomAnimal.component width={75} height={75} fill="#9B59B6" />
      </View>

      {/* All animals in a row */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Animals</Text>
        <View style={styles.row}>
          {animalNames.map((animalName) => (
            <Animal
              key={animalName}
              name={animalName}
              width={40}
              height={40}
              style={styles.animalIcon}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  section: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: "white",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#555",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  animalIcon: {
    margin: 5,
  },
});

export default SvgExample;
