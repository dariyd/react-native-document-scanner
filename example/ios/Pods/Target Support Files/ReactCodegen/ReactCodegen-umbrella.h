#ifdef __OBJC__
#import <UIKit/UIKit.h>
#else
#ifndef FOUNDATION_EXPORT
#if defined(__cplusplus)
#define FOUNDATION_EXPORT extern "C"
#else
#define FOUNDATION_EXPORT extern
#endif
#endif
#endif

#import "RCTModuleProviders.h"
#import "RCTModulesConformingToProtocolsProvider.h"
#import "RCTThirdPartyComponentsProvider.h"
#import "RCTUnstableModulesRequiringMainQueueSetupProvider.h"
#import "RNDocumentScannerSpec/RNDocumentScannerSpec.h"
#import "RNDocumentScannerSpecJSI.h"

FOUNDATION_EXPORT double ReactCodegenVersionNumber;
FOUNDATION_EXPORT const unsigned char ReactCodegenVersionString[];

