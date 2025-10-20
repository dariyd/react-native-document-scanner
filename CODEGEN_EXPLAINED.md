# How React Native Codegen Works

## What is Codegen?

Codegen is React Native's code generator that creates native code (Objective-C++/C++ for iOS, Java/C++ for Android) from TypeScript specifications. This ensures type safety between JavaScript and native code.

## The Generation Process

### 1. TypeScript Spec (`src/NativeDocumentScanner.ts`)

```typescript
export interface Options {
  quality?: number;
  includeBase64?: boolean;
}

export interface Spec extends TurboModule {
  launchScanner(options: Options, callback: (result: ScanResult) => void): void;
}
```

This is your **source of truth** for the API.

### 2. package.json Configuration

```json
{
  "codegenConfig": {
    "name": "RNDocumentScannerSpec",
    "type": "modules",
    "jsSrcsDir": "src"
  }
}
```

Tells codegen:
- **name**: `RNDocumentScannerSpec` - name for generated files
- **type**: `modules` - generating a module (not a component)
- **jsSrcsDir**: `src` - where to find TypeScript specs

### 3. When Does Codegen Run?

**iOS**: During `pod install` when new architecture is enabled
**Android**: During Gradle build when new architecture is enabled

### 4. Generated Files (iOS)

When you run `pod install` with `ENV['RCT_NEW_ARCH_ENABLED'] = '1'`, codegen creates:

```
ios/build/generated/ios/
├── RNDocumentScannerSpec/
│   ├── RNDocumentScannerSpec.h          # Protocol definition
│   └── RNDocumentScannerSpec-generated.mm
├── RNDocumentScannerSpecJSI.h           # JSI bindings
└── RNDocumentScannerSpecJSI-generated.cpp
```

### 5. What Gets Generated?

**RNDocumentScannerSpec.h** contains:

```objc
// C++ struct for options
namespace JS {
  namespace NativeDocumentScanner {
    struct Options {
      std::optional<double> quality() const;
      std::optional<bool> includeBase64() const;
    };
  }
}

// Protocol your native module must implement
@protocol NativeDocumentScannerSpec <RCTBridgeModule, RCTTurboModule>
- (void)launchScanner:(JS::NativeDocumentScanner::Options &)options
             callback:(RCTResponseSenderBlock)callback;
@end

// Base class for your module
@interface NativeDocumentScannerSpecBase : NSObject
@end

// JSI wrapper
namespace facebook::react {
  class NativeDocumentScannerSpecJSI : public ObjCTurboModule {
  public:
    NativeDocumentScannerSpecJSI(const ObjCTurboModule::InitParams &params);
  };
}
```

## How Your Native Module Uses It

### Header File (`DocumentScanner.h`)

```objc
#ifdef RCT_NEW_ARCH_ENABLED
#import <RNDocumentScannerSpec/RNDocumentScannerSpec.h>

// Inherit from base class and conform to protocol
@interface DocumentScanner : NativeDocumentScannerSpecBase <NativeDocumentScannerSpec>
#else
@interface DocumentScanner : NSObject <RCTBridgeModule>
#endif
```

### Implementation File (`DocumentScanner.m`)

```objc
using namespace facebook::react;

@implementation DocumentScanner

#ifdef RCT_NEW_ARCH_ENABLED
// Return the JSI wrapper
- (std::shared_ptr<TurboModule>)getTurboModule:(const ObjCTurboModule::InitParams &)params
{
    return std::make_shared<NativeDocumentScannerSpecJSI>(params);
}

// Implement the protocol method
- (void)launchScanner:(JS::NativeDocumentScanner::Options &)options
             callback:(RCTResponseSenderBlock)callback
{
    // Convert C++ struct to NSDictionary
    NSMutableDictionary *opts = [NSMutableDictionary new];
    if (options.quality().has_value()) {
        opts[@"quality"] = @(options.quality().value());
    }
    // ... use opts
}
#else
// Old architecture uses macro
RCT_EXPORT_METHOD(launchScanner:(NSDictionary *)options callback:(RCTResponseSenderBlock)callback)
{
    // ... implementation
}
#endif
```

## Key Differences: Old vs New Architecture

### Old Architecture
- **JS → Native**: Bridge serializes objects to JSON
- **Parameter Type**: `NSDictionary *` (Objective-C type)
- **Registration**: Via `RCT_EXPORT_METHOD()` macro
- **Runtime**: Method lookup via string names

### New Architecture
- **JS → Native**: Direct JSI calls (no serialization)
- **Parameter Type**: `JS::NativeDocumentScanner::Options &` (C++ struct)
- **Registration**: Via `getTurboModule()` returning JSI wrapper
- **Compile Time**: Type-checked at compile time

## Why You Got Errors

### Before Fix:
```objc
RCT_EXPORT_METHOD(launchScanner:(NSDictionary *)options ...)
```

This worked for old architecture but **didn't implement the protocol** required by new architecture.

### After Fix:
```objc
#ifdef RCT_NEW_ARCH_ENABLED
- (void)launchScanner:(JS::NativeDocumentScanner::Options &)options
             callback:(RCTResponseSenderBlock)callback
{
    // Implements the NativeDocumentScannerSpec protocol
}
#else
RCT_EXPORT_METHOD(launchScanner:(NSDictionary *)options ...)
{
    // Old architecture
}
#endif
```

Now it implements the correct signature for each architecture.

## Troubleshooting

### "Could not build module 'ReactCodegen'"
**Cause**: Codegen hasn't run yet
**Fix**: Run `pod install` after enabling new architecture

### "Expected a type" / Method signature errors
**Cause**: Your implementation doesn't match the generated protocol
**Fix**: Check generated `.h` file and match the exact signature

### Codegen didn't generate files
**Causes**:
1. `RCT_NEW_ARCH_ENABLED` not set to '1'
2. TypeScript spec has errors
3. `codegenConfig` missing from package.json

**Fix**: Check all three, clean, and run `pod install` again

## Build Process Flow

### With New Architecture Enabled:

1. **Run `pod install`**
   ```
   Podfile: ENV['RCT_NEW_ARCH_ENABLED'] = '1'
   ↓
   prepare_react_native_project!
   ↓
   Reads package.json → Finds codegenConfig
   ↓
   Reads src/NativeDocumentScanner.ts
   ↓
   Generates RNDocumentScannerSpec files in ios/build/generated/ios/
   ↓
   Creates ReactCodegen.podspec with generated code
   ↓
   Installs ReactCodegen pod
   ```

2. **Xcode Build**
   ```
   Compiles generated C++/Obj-C++ files
   ↓
   Compiles your DocumentScanner.m (which imports generated .h)
   ↓
   Links everything together
   ↓
   App has TurboModule support!
   ```

## Summary

✅ **TypeScript spec** → defines the API
✅ **Codegen** → generates native protocol and JSI bindings
✅ **Your code** → implements the protocol
✅ **Result** → Type-safe, performant native module!

The codegen ensures that your TypeScript types, native iOS code, and native Android code all match perfectly!

