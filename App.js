import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Camera } from "expo-camera";
import * as FaceDetector from "expo-face-detector";
import { BarCodeScanner } from "expo-barcode-scanner";
import * as MediaLibrary from "expo-media-library";

//Icons
import { MaterialIcons } from "@expo/vector-icons";

export default function App() {
  const [hasCameraPermission, setHasPermission] = useState(null);
  const [hasMediaPermission, setHasMediaPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [faceDetected, setFaceDetected] = useState(false);
  const [facePosition, setFacePosition] = useState();
  const ref = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasMediaPermission(status === "granted");
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleFacesDetected = ({ faces }) => {
    if (faces.length != 0) {
      setFaceDetected(true);
      setFacePosition(faces[0].bounds);
    } else {
      setFaceDetected(false);
    }
  };

  // const handleBarcodeDetected = ({ data }) => {
  //   console.log(data);
  // };

  const displayFaceDetected = () => {
    if (faceDetected) {
      return (
        <View
          style={{
            flex: 1,
            borderColor: "red",
            borderWidth: 5,
            position: "absolute",
            top: facePosition.origin.y,
            left: facePosition.origin.x,
            height: facePosition.size.height,
            width: facePosition.size.width,
          }}
        ></View>
      );
    } else {
      return <View></View>;
    }
  };

  const onPressSnapButton = async () => {
    let options = {
      quality: 1,
    };

    if (ref && hasMediaPermission) {
      const PictureData = await ref.current.takePictureAsync(options);
      MediaLibrary.saveToLibraryAsync(PictureData.uri);
    } else {
      console.log("pas d'accès aux medias");
    }
  };

  if (hasCameraPermission === null) {
    return <View />;
  }
  if (hasCameraPermission === false) {
    return <Text>No access to camera</Text>;
  }
  return (
    <SafeAreaView style={styles.container}>
      <Camera
        ratio="16:9"
        style={styles.camera}
        type={type}
        ref={ref}
        onFacesDetected={handleFacesDetected}
        //onBarCodeScanned={handleBarcodeDetected}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
          runClassifications: FaceDetector.FaceDetectorClassifications.none,
          minDetectionInterval: 10,
          tracking: true,
        }}
      >
        <View style={styles.flipButtonContainer}>
          <TouchableOpacity
            style={styles.flipButton}
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}
          >
            <MaterialIcons
              style={styles.flipIcon}
              name="flip-camera-ios"
              size={50}
              color="white"
            />
          </TouchableOpacity>
        </View>
        {displayFaceDetected()}
        <View style={styles.snapButtonContainer}>
          <TouchableOpacity
            style={styles.snapButton}
            onPress={onPressSnapButton}
          >
            <MaterialIcons name="camera" size={50} color="white" />
          </TouchableOpacity>
        </View>
      </Camera>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },

  flipButtonContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    top: 20,
    alignItems: "flex-start",
  },
  flipIcon: {},
  camera: {
    flex: 1,
    padding: 10,
  },
  snapButtonContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    bottom: 20,
    alignItems: "flex-end",
  },
});
