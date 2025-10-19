// DocumentScanner.h

#import <React/RCTBridgeModule.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <RNDocumentScannerSpec/RNDocumentScannerSpec.h>

@interface DocumentScanner : NSObject <NativeDocumentScannerSpec>
#else
@interface DocumentScanner : NSObject <RCTBridgeModule>
#endif

@end
