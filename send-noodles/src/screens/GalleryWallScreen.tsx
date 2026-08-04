import React from "react";
import { ScrollView, StyleSheet, Text, View, Pressable, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

// Original horizontal coordinates re-mapped so they stack vertically 
// down an upright phone screen.
const IMAGES = [
  {
    id: "1",
    x: 40,   // horizontal position on upright screen
    y: 80,   // vertical offset (down the phone)
    w: 110,
    h: 150,
    border: "#7DBE74",
    color: "#B38A65",
  },
  {
    id: "2",
    x: 170,
    y: 190,
    w: 95,
    h: 95,
    border: "#65B07B",
    color: "#C58452",
  },
  {
    id: "3",
    x: 50,
    y: 310,
    w: 100,
    h: 140,
    border: "#4D6F91",
    color: "#9F7B5C",
  },
  {
    id: "4",
    x: 160,
    y: 470,
    w: 130,
    h: 180,
    border: "#D46262",
    color: "#8D6648",
  },
  {
    id: "5",
    x: 45,
    y: 670,
    w: 95,
    h: 95,
    border: "#D9B53D",
    color: "#C99C77",
  },
  {
    id: "6",
    x: 155,
    y: 790,
    w: 140,
    h: 120,
    border: "#87A569",
    color: "#A87457",
  },
];

export default function GalleryWallScreen() {
  return (
    <View style={styles.container}>
      
      {/* Top Left Rotated Memories Box */}
      <Pressable style={styles.memoryBox}>
        <View style={styles.label} />
        <Text style={styles.memoryText}>Memories</Text>
      </Pressable>

      {/* Wall Title positioned top right */}
      <Text style={styles.wallTitle}>the wall</Text>

      {/* Vertical ScrollView */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.canvas}>
          {IMAGES.map((photo) => (
            <View
              key={photo.id}
              style={[
                styles.photo,
                {
                  left: photo.x,
                  top: photo.y,
                  width: photo.w,
                  height: photo.h,
                  borderColor: photo.border,
                  backgroundColor: photo.color,
                },
              ]}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F0E8",
  },

  scrollContent: {
    paddingTop: 100, // Safe distance below rotated Memory box & title
    paddingBottom: 60,
  },

  canvas: {
    width: "100%",
    height: 960, // Total height so all images fit vertically
    position: "relative",
  },

  wallTitle: {
    position: "absolute",
    right: 24,
    top: 55,
    fontSize: 28,
    fontStyle: "italic",
    color: "#7E7465",
    zIndex: 20,
  },

  photo: {
    position: "absolute",
    borderWidth: 4,
  },

  memoryBox: {
    position: "absolute",
    top: 50,
    left: -20,
    width: 110,
    height: 70,
    backgroundColor: "#B09157",
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "90deg" }],
    zIndex: 30,
  },

  label: {
    width: 35,
    height: 12,
    backgroundColor: "#F8F4E9",
    marginBottom: 8,
  },

  memoryText: {
    fontSize: 13,
    color: "#2A251D",
  },
});