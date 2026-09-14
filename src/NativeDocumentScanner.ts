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

export interface ScanResult {
  didCancel?: boolean;
  error?: boolean;
  errorMessage?: string;
  images?: ImageObject[];
}

export interface Options {
  quality?: number;
  includeBase64?: boolean;
  includeExif?: boolean;
  includeLocationExif?: boolean;
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
}

export interface Spec extends TurboModule {
  launchScanner(options: Options, callback: (result: ScanResult) => void): void;
}

export default TurboModuleRegistry.get<Spec>('DocumentScanner');

