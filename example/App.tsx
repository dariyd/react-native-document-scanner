/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState} from 'react';
import {
  Alert,
  Button,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import {launchScanner} from 'react-native-document-scanner';

interface ScannedImage {
  uri: string;
  fileName: string;
  fileSize: number;
  width: number;
  height: number;
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [images, setImages] = useState<ScannedImage[]>([]);
  const [status, setStatus] = useState<string>('');

  const handleScan = async () => {
    try {
      setStatus('Launching scanner...');
      
      // ML Kit Document Scanner handles permissions internally on Android
      // iOS VisionKit also handles its own permissions
      const result = await launchScanner({quality: 0.8});

      if (result.didCancel) {
        setStatus('Scan cancelled');
      } else if (result.error) {
        setStatus(`Error: ${result.errorMessage || 'Unknown error'}`);
        Alert.alert('Error', result.errorMessage || 'Failed to scan');
      } else if (result.images && result.images.length > 0) {
        setImages(result.images);
        setStatus(`Scanned ${result.images.length} page(s) successfully!`);
        Alert.alert('Success', `Scanned ${result.images.length} page(s)`);
      } else {
        setStatus('No images scanned');
      }
    } catch (error: any) {
      console.error('Scan error:', error);
      setStatus(`Error: ${error.message}`);
      Alert.alert('Error', error.message || 'Failed to scan document');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Document Scanner Test</Text>
      </View>

      <View style={styles.content}>
        <Button title="📄 Scan Document" onPress={handleScan} color="#007AFF" />

        {status ? (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        ) : null}

        {images.length > 0 && (
          <>
            <Text style={styles.subtitle}>
              Scanned Images ({images.length})
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={true}
              style={styles.scrollView}>
              {images.map((image, index) => (
                <View key={image.fileName} style={styles.imageContainer}>
                  <Image source={{uri: image.uri}} style={styles.thumbnail} />
                  <Text style={styles.imageInfo}>
                    Page {index + 1}
                    {'\n'}
                    {Math.round(image.fileSize / 1024)}KB
                  </Text>
                </View>
              ))}
            </ScrollView>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#1976d2',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
    color: '#333',
  },
  scrollView: {
    flexGrow: 0,
  },
  imageContainer: {
    marginRight: 12,
    alignItems: 'center',
  },
  thumbnail: {
    width: 120,
    height: 160,
    borderRadius: 8,
    backgroundColor: '#ddd',
  },
  imageInfo: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    color: '#666',
  },
});

export default App;
