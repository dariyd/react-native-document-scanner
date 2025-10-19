/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
  Image,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';

import {
  Colors,
  Header,
} from 'react-native/Libraries/NewAppScreen';

import { launchScanner } from 'react-native-document-scanner';

const Section = ({children, title}) => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState('');

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs camera access to scan documents',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS handles permissions automatically
  };

  const startScan = async () => {
    try {
      setStatus('Requesting permissions...');
      
      // Request camera permission on Android
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Camera permission is required to scan documents');
        setStatus('Permission denied');
        return;
      }

      setStatus('Launching scanner...');
      const results = await launchScanner({ quality: 0.8 });
      
      console.log('Scan results:', results);
      
      if (results.didCancel) {
        setStatus('Scan cancelled');
        Alert.alert('Cancelled', 'Document scan was cancelled');
      } else if (results.error) {
        setStatus(`Error: ${results.errorMessage || 'Unknown error'}`);
        Alert.alert('Error', results.errorMessage || 'Failed to scan document');
      } else if (Array.isArray(results?.images) && results.images.length > 0) {
        setImages(results.images);
        setStatus(`Successfully scanned ${results.images.length} page(s)`);
        Alert.alert('Success', `Scanned ${results.images.length} page(s)`);
      } else {
        setStatus('No images scanned');
      }
    } catch (error) {
      console.error('Scan error:', error);
      setStatus(`Error: ${error.message}`);
      Alert.alert('Error', error.message || 'Failed to scan document');
    }
  };

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="Document Scanner Example">
            Press <Text style={styles.highlight}>START SCAN</Text> to open the document scanner.
            {'\n\n'}
            Platform: <Text style={styles.highlight}>{Platform.OS}</Text>
          </Section>

          <View style={styles.buttonContainer}>
            <Button title="START SCAN" onPress={startScan} color="#007AFF" />
          </View>

          {status ? (
            <View style={styles.statusContainer}>
              <Text style={[styles.statusText, { color: isDarkMode ? Colors.light : Colors.dark }]}>
                Status: {status}
              </Text>
            </View>
          ) : null}

          {images.length > 0 && (
            <Section title={`Scanned Images (${images.length})`}>
              Scroll horizontally to view all scanned pages
            </Section>
          )}
        </View>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}
        horizontal
        showsHorizontalScrollIndicator={true}
      >
        {images.map((image, index) => (
          <View key={image.fileName} style={styles.imageContainer}>
            <Image source={{ uri: image.uri }} style={styles.thumb} />
            <Text style={[styles.imageInfo, { color: isDarkMode ? Colors.light : Colors.dark }]}>
              Page {index + 1}
              {'\n'}
              {Math.round(image.fileSize / 1024)}KB
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  highlight: {
    fontWeight: '700',
    color: '#007AFF',
  },
  buttonContainer: {
    marginHorizontal: 24,
    marginVertical: 16,
  },
  statusContainer: {
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  imageContainer: {
    marginHorizontal: 8,
    alignItems: 'center',
  },
  thumb: {
    width: 120,
    height: 160,
    borderRadius: 8,
    marginVertical: 8,
  },
  imageInfo: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default App;
