// main index.js

import { NativeModules, Platform } from 'react-native';

// Try to get the TurboModule (new architecture)
let DocumentScannerModule;
try {
  DocumentScannerModule = require('./src/NativeDocumentScanner').default;
} catch (e) {
  // Fall back to old architecture
  DocumentScannerModule = NativeModules.DocumentScanner;
}

// If still not available, try the old way
if (!DocumentScannerModule) {
  DocumentScannerModule = NativeModules.DocumentScanner;
}

export default DocumentScannerModule;

const DEFAULT_OPTIONS = {
  quality: 1,
  includeBase64: false,
};

export function launchScanner(options = {}, callback) {
  return new Promise((resolve, reject) => {
    if (!DocumentScannerModule) {
      const error = {
        error: true,
        errorMessage: 'DocumentScanner module is not available',
      };
      if (callback) callback(error);
      reject(error);
      return;
    }

    DocumentScannerModule.launchScanner(
      {...DEFAULT_OPTIONS, ...options},
      (result) => {
        if (callback) callback(result);
        resolve(result);
      },
    );
  });  
}