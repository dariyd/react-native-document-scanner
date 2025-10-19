// Type definitions for react-native-document-scanner
// Project: https://github.com/dariyd/react-native-document-scanner

export interface ImageObject {
  /**
   * The base64 string of the image (only if includeBase64 option is true)
   */
  base64?: string;
  
  /**
   * The file URI in app specific cache storage
   */
  uri: string;
  
  /**
   * Image width in pixels
   */
  width: number;
  
  /**
   * Image height in pixels
   */
  height: number;
  
  /**
   * The file size in bytes
   */
  fileSize: number;
  
  /**
   * The file MIME type (e.g., "image/jpeg")
   */
  type: string;
  
  /**
   * The file name
   */
  fileName: string;
}

export interface ScanResult {
  /**
   * True if the user cancelled the scanning process
   */
  didCancel?: boolean;
  
  /**
   * True if an error occurred
   */
  error?: boolean;
  
  /**
   * Description of the error (for debug purposes only)
   */
  errorMessage?: string;
  
  /**
   * Array of scanned images
   */
  images?: ImageObject[];
}

export interface ScanOptions {
  /**
   * Image quality from 0 to 1 (default: 1)
   * Lower values reduce file size
   * 
   * @default 1
   */
  quality?: number;
  
  /**
   * If true, includes base64 string of the image in the result
   * Avoid using on large image files due to performance impact
   * 
   * @default false
   */
  includeBase64?: boolean;
}

/**
 * Launch the document scanner
 * 
 * @param options - Scanner options
 * @param callback - Optional callback function
 * @returns Promise that resolves with the scan result
 * 
 * @example
 * ```typescript
 * import { launchScanner } from 'react-native-document-scanner';
 * 
 * // Basic usage
 * const result = await launchScanner();
 * 
 * // With options
 * const result = await launchScanner({
 *   quality: 0.8,
 *   includeBase64: false,
 * });
 * 
 * // With callback
 * launchScanner({ quality: 0.9 }, (result) => {
 *   if (result.didCancel) {
 *     console.log('User cancelled');
 *   } else if (result.error) {
 *     console.log('Error:', result.errorMessage);
 *   } else {
 *     console.log('Scanned images:', result.images);
 *   }
 * });
 * ```
 */
export function launchScanner(
  options?: ScanOptions,
  callback?: (result: ScanResult) => void
): Promise<ScanResult>;

declare const DocumentScanner: {
  launchScanner: (
    options: ScanOptions,
    callback: (result: ScanResult) => void
  ) => void;
};

export default DocumentScanner;

