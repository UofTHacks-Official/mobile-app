import { CameraView, useCameraPermissions } from "expo-camera";
import { useNavigation } from "expo-router";
import { useEffect } from "react";
import { Button, Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, { Defs, Mask, Rect } from "react-native-svg";

const { width, height } = Dimensions.get("window");
const SCAN_SIZE = 250; // Size of the clear scan area

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: { display: "none" },
    });
    return () => {
      navigation.setOptions({
        tabBarStyle: { display: "flex" },
      });
    };
  }, [navigation]);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  // Calculate scan area position
  const scanAreaTop = (height - SCAN_SIZE) / 2;
  const scanAreaLeft = (width - SCAN_SIZE) / 2;

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={"back"}>
        {/* SVG Mask Overlay */}
        <Svg height={height} width={width} style={StyleSheet.absoluteFill}>
          <Defs>
            <Mask id="mask" x="0" y="0" width={width} height={height}>
              {/* Everything is masked (visible) by default */}
              <Rect x="0" y="0" width={width} height={height} fill="white" />
              {/* The scan area is transparent (not masked) */}
              <Rect
                x={scanAreaLeft}
                y={scanAreaTop}
                width={SCAN_SIZE}
                height={SCAN_SIZE}
                rx={40} // borderRadius
                fill="black"
              />
            </Mask>
          </Defs>
          {/* The overlay uses the mask */}
          <Rect
            x="0"
            y="0"
            width={width}
            height={height}
            fill="rgba(0,0,0,0.6)"
            mask="url(#mask)"
          />
        </Svg>

        {/* Scan Area Border */}
        <View
          style={[
            styles.scanArea,
            {
              top: scanAreaTop,
              left: scanAreaLeft,
              width: SCAN_SIZE,
              height: SCAN_SIZE,
            },
          ]}
          pointerEvents="none"
        />
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center" },
  message: { textAlign: "center", paddingBottom: 10 },
  camera: { flex: 1 },
  fullOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)", // Darker overlay
  },
  scanArea: {
    position: "absolute",
    borderColor: "#fff",
    borderWidth: 3,
    borderRadius: 40,
    zIndex: 20,
  },
});
