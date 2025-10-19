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
}

export interface Spec extends TurboModule {
  launchScanner(options: Options, callback: (result: ScanResult) => void): void;
}

export default TurboModuleRegistry.get<Spec>('DocumentScanner');

