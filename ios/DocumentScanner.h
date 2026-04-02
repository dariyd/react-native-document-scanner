// DocumentScanner.h

#import <React/RCTBridgeModule.h>
#import <CoreLocation/CoreLocation.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <RNDocumentScannerSpec/RNDocumentScannerSpec.h>

@interface DocumentScanner : NativeDocumentScannerSpecBase <NativeDocumentScannerSpec, CLLocationManagerDelegate>
#else
@interface DocumentScanner : NSObject <RCTBridgeModule, CLLocationManagerDelegate>
#endif

@end
