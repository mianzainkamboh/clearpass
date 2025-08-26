import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { validateTempLoginToken } from '../services/apiService';

const QRScannerScreen = () => {
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    // Permissions are still loading
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // No permission
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to use the camera</Text>
        <TouchableOpacity
          style={styles.scanAgainButton}
          onPress={requestPermission}
        >
          <Text style={styles.scanAgainText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = ({ data }) => {
    if (scanned) return;
    setScanned(true);

    try {
      let tempLoginToken;

      // Try parsing JSON
      try {
        const qrData = JSON.parse(data);
        tempLoginToken = qrData.tempLoginToken;
      } catch (e) {
        tempLoginToken = data; // fallback raw string
      }

      if (!tempLoginToken) {
        Alert.alert('Invalid QR Code', 'No tempLoginToken found in QR code');
        setScanned(false);
        return;
      }

      // Validate the tempLoginToken
      if (!validateTempLoginToken(tempLoginToken)) {
        Alert.alert(
          'Invalid QR Code', 
          'This QR code is not authorized for login approval. Please scan a valid QR code.',
          [{ text: 'OK', onPress: () => setScanned(false) }]
        );
        return;
      }

      // Navigate to Approval screen only if validation passes
      navigation.navigate('Approval', { tempLoginToken });
    } catch (error) {
      Alert.alert('Error', 'Failed to process QR code');
      setScanned(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
      </View>

      {/* Camera */}
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      >
        <View style={styles.overlay}>
          <Text style={styles.instructions}>
            Position the QR code within the camera view
          </Text>
          {scanned && (
            <View style={styles.scannedContainer}>
              <Text style={styles.scannedText}>QR Code Scanned!</Text>
            </View>
          )}
        </View>
      </CameraView>

      {/* Scan Again */}
      {scanned && (
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.scanAgainButton}
            onPress={() => setScanned(false)}
          >
            <Text style={styles.scanAgainText}>Scan Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  instructions: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  scannedContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  scannedText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomActions: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  scanAgainButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: 'center',
  },
  scanAgainText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
});

export default QRScannerScreen;
