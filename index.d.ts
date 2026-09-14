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

  /**
   * EXIF metadata of the image (only if includeExif option is true)
   * Contains timestamps, device info, dimensions, and optionally GPS data
   */
  exif?: Record<string, any>;
}

/**
 * PDF of all scanned pages (Android only, when `includePdf` is true).
 * Built by ML Kit at its own resolution — `quality`, `maxWidth`/`maxHeight`
 * and EXIF options do not affect it.
 */
export interface PdfObject {
  /**
   * The file URI in app specific cache storage
   */
  uri: string;

  /**
   * Number of pages in the PDF
   */
  pageCount: number;

  /**
   * The file size in bytes
   */
  fileSize: number;

  /**
   * The file name
   */
  fileName: string;

  /**
   * The file MIME type ("application/pdf")
   */
  type: string;
}

/**
 * ML Kit scanner mode (Android only)
 * - `base`: basic editing (crop, rotate, reorder pages)
 * - `base_with_filter`: base + image filters (grayscale, auto enhancement)
 * - `full`: base_with_filter + ML-enabled cleaning (erase stains, fingers, etc.)
 */
export type ScannerMode = 'base' | 'base_with_filter' | 'full';

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

  /**
   * PDF of all scanned pages. Android only — present only when
   * `includePdf` is true. Never set on iOS.
   */
  pdf?: PdfObject;
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

  /**
   * If true, includes EXIF metadata (timestamps, device info, dimensions) in the result
   * EXIF data is also embedded in the saved image file
   *
   * @default false
   */
  includeExif?: boolean;

  /**
   * If true, includes GPS coordinates in the EXIF metadata
   * Requires location permission (the package will request it automatically)
   * If permission is denied, scanning still works but GPS fields are skipped
   *
   * iOS: Requires NSLocationWhenInUseUsageDescription in Info.plist
   * Android: Requires ACCESS_FINE_LOCATION permission
   *
   * @default false
   */
  includeLocationExif?: boolean;

  /**
   * Cap the encoded image's long edge at this many pixels. Both
   * `maxWidth` and `maxHeight` are honored: the native resizer uses
   * the smaller scaling factor of the two so neither axis exceeds
   * its cap. Aspect ratio is preserved.
   *
   * Pass `0` or omit to disable. Defaults to no cap (native scanner
   * resolution is returned, which can be 3000+ pixels).
   *
   * iOS: implemented via `UIGraphicsImageRenderer` before
   * `UIImageJPEGRepresentation` / `UIImagePNGRepresentation`.
   * Android: implemented via `Bitmap.createScaledBitmap` before
   * `Bitmap.compress`.
   *
   * @default 0 (no cap)
   */
  maxWidth?: number;

  /**
   * See {@link maxWidth}. Both values are applied together.
   *
   * @default 0 (no cap)
   */
  maxHeight?: number;

  /**
   * **Android only.** Maximum number of pages that can be scanned in one
   * session. Values below 1 are treated as 1. Ignored on iOS.
   *
   * @default 10
   */
  pageLimit?: number;

  /**
   * **Android only.** If true, the ML Kit scanner lets the user import
   * images from the gallery instead of using the camera. Ignored on iOS.
   *
   * @default false
   */
  galleryImportAllowed?: boolean;

  /**
   * **Android only.** ML Kit scanner mode — see {@link ScannerMode}.
   * Unknown values fall back to `'full'`. Ignored on iOS.
   *
   * @default 'full'
   */
  scannerMode?: ScannerMode;

  /**
   * **Android only.** If true, the response also contains a `pdf` object
   * with all scanned pages in a single PDF file. `images` is always
   * returned regardless of this flag. Ignored on iOS (no `pdf` field).
   *
   * Note: the PDF is built by ML Kit at its own resolution — `quality`,
   * `maxWidth`/`maxHeight` and EXIF options do not apply to it.
   *
   * @default false
   */
  includePdf?: boolean;
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

