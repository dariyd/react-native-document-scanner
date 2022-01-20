// main index.js

import { NativeModules } from 'react-native';

const { DocumentScanner } = NativeModules;

export default DocumentScanner;

const DEFAULT_OPTIONS = {
  quality: 1,
  includeBase64: false,
};

export function launchScanner(options, callback) {
  return new Promise(resolve => {
    DocumentScanner.launchScanner(
      {...DEFAULT_OPTIONS, ...options},
      (result) => {
        if(callback) callback(result);
        resolve(result);
      },
    );
  });  
}