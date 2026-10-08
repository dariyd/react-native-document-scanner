import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import { TurboModuleRegistry } from 'react-native';

export interface ImageObject {
  base64?: string;
  uri: string;
  width: number;
  height: number;
  fileSize: number;
  type: string;
  fileName: string;
  exif?: Record<string, any>;
}

export interface PdfObject {
  uri: string;
  pageCount: number;
  fileSize: number;
  fileName: string;
  type: string;
}

export interface ScanResult {
  didCancel?: boolean;
  error?: boolean;
  errorMessage?: string;
  images?: ImageObject[];
  pdf?: PdfObject;
}

export interface Options {
  quality?: number;
  includeBase64?: boolean;
  includeExif?: boolean;
  includeLocationExif?: boolean;
  /** One of 'approximate' | 'balanced' | 'precise'. Default 'precise'. */
  locationAccuracy?: string;
  /** Whether the scanner may prompt for location permission. Default true. */
  requestLocationPermission?: boolean;
  /** iOS only. NSLocationTemporaryUsageDescriptionDictionary key for the precise-location upgrade. */
  locationPurposeKey?: string;
  /**
   * Cap the long edge of the encoded image at this many pixels. The
   * native side keeps aspect ratio: the actual output is `min(scale)`
   * applied to both axes. Pass `0` (or omit) to disable.
   */
  maxWidth?: number;
  /**
   * Sibling of `maxWidth` — caps the OTHER dimension. Both are
   * applied; the smaller of the two scaling factors wins so neither
   * axis exceeds its cap.
   */
  maxHeight?: number;
  /** Android only. Max number of pages per scan session. Default 10. */
  pageLimit?: number;
  /** Android only. Allow importing from the gallery. Default false. */
  galleryImportAllowed?: boolean;
  /** Android only. One of 'base' | 'base_with_filter' | 'full'. Default 'full'. */
  scannerMode?: string;
  /** Android only. Also return a PDF of all pages as `pdf`. Default false. */
  includePdf?: boolean;
}

export interface Spec extends TurboModule {
  launchScanner(options: Options, callback: (result: ScanResult) => void): void;
}

export default TurboModuleRegistry.get<Spec>('DocumentScanner');

