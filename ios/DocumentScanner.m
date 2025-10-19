// DocumentScanner.m

#import "DocumentScanner.h"
#import "VisionKit/VisionKit.h"
#import "VisionKit/VNDocumentCameraViewController.h"
#import <React/RCTUtils.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <RNDocumentScannerSpec/RNDocumentScannerSpec.h>
#endif

@interface DocumentScanner ()

@property (nonatomic, strong) RCTResponseSenderBlock callback;
@property (nonatomic, copy) NSDictionary *options;
@end


@interface DocumentScanner (VNDocumentCameraViewControllerDelegate) <VNDocumentCameraViewControllerDelegate>
@end

@implementation DocumentScanner

RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup
{
    return NO;
}

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeDocumentScannerSpecJSI>(params);
}
#endif

RCT_EXPORT_METHOD(launchScanner:(NSDictionary *)options callback:(RCTResponseSenderBlock)callback)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        [self launchDocScanner:options callback:callback];
    });
}

- (void)launchDocScanner:(NSDictionary *)options callback:(RCTResponseSenderBlock)callback
{
    self.callback = callback;
    self.options = options;
    
    VNDocumentCameraViewController * scanner = [[VNDocumentCameraViewController alloc] init];
    scanner.delegate = self;
//    dispatch_async(dispatch_get_main_queue(), ^{
//            UIViewController *root = RCTPresentedViewController();
//            [root presentViewController:scanner animated:YES completion:nil];
//        });
    
    [RCTPresentedViewController() presentViewController:scanner animated:YES completion:nil];
    // this is used when rootViewController is set in AppDelegate
//     [[UIApplication sharedApplication].delegate.window.rootViewController presentViewController:scanner animated:YES completion:nil];
    
}
@end

@implementation DocumentScanner (VNDocumentCameraViewControllerDelegate)

+ (NSString*) getFileType:(NSData *)imageData
{
    const uint8_t firstByteJpg = 0xFF;
    const uint8_t firstBytePng = 0x89;
    const uint8_t firstByteGif = 0x47;
    
    uint8_t firstByte;
    [imageData getBytes:&firstByte length:1];
    switch (firstByte) {
      case firstByteJpg:
        return @"jpg";
      case firstBytePng:
        return @"png";
      case firstByteGif:
        return @"gif";
      default:
        return @"jpg";
    }
}

- (NSString *)getImageFileName:(NSString *)fileType
{
    NSString *fileName = [[NSUUID UUID] UUIDString];
    fileName = [fileName stringByAppendingString:@"."];
    return [fileName stringByAppendingString:fileType];
}

-(NSMutableDictionary *)mapImageToAsset:(UIImage *)image {
//    NSString *fileType = [DocumentScanner getFileType:UIImagePNGRepresentation(image)];
    NSString *fileType = self.options[@"quality"] != nil && [self.options[@"quality"] floatValue] < 1.0 ? @"jpg" : @"png";
    NSData *data = nil;

    if ([fileType isEqualToString:@"jpg"]) {
        data = UIImageJPEGRepresentation(image, [self.options[@"quality"] floatValue]);
    } else if ([fileType isEqualToString:@"png"]) {
        data = UIImagePNGRepresentation(image);
    }
    
    NSMutableDictionary *asset = [[NSMutableDictionary alloc] init];
    asset[@"type"] = [@"image/" stringByAppendingString:fileType];

    NSString *fileName = [self getImageFileName:fileType];
    NSString *path = [[NSTemporaryDirectory() stringByStandardizingPath] stringByAppendingPathComponent:fileName];
    [data writeToFile:path atomically:YES];

    if ([self.options[@"includeBase64"] boolValue]) {
        asset[@"base64"] = [data base64EncodedStringWithOptions:0];
    }

    NSURL *fileURL = [NSURL fileURLWithPath:path];
    asset[@"uri"] = [fileURL absoluteString];

    NSNumber *fileSizeValue = nil;
    NSError *fileSizeError = nil;
    [fileURL getResourceValue:&fileSizeValue forKey:NSURLFileSizeKey error:&fileSizeError];
    if (fileSizeValue){
        asset[@"fileSize"] = fileSizeValue;
    }

    asset[@"fileName"] = fileName;
    asset[@"width"] = @(image.size.width);
    asset[@"height"] = @(image.size.height);
    
    return asset;
}


- (void)imagePickerControllerDidCancel:(UIImagePickerController *)picker
{
    dispatch_async(dispatch_get_main_queue(), ^{
        [picker dismissViewControllerAnimated:YES completion:^{
            self.callback(@[@{@"didCancel": @YES}]);
        }];
    });
}

- (void)documentCameraViewController:(VNDocumentCameraViewController *)controller didFinishWithScan:(VNDocumentCameraScan *)scan{
    NSMutableArray *scannedImages = [NSMutableArray array];
    int i;
    for (i = 0; i < [scan pageCount]; i++) {
        UIImage *image =  [scan imageOfPageAtIndex:i];
        [scannedImages addObject:[self mapImageToAsset:image]];
    }
    
    [controller dismissViewControllerAnimated:true completion:^{
        self.callback(@[@{@"images": scannedImages}]);
    }];
}

- (void)documentCameraViewControllerDidCancel:(VNDocumentCameraViewController *)controller {
    [controller dismissViewControllerAnimated:true completion:^{
        self.callback(@[@{@"didCancel": @YES}]);
    }];
}

- (void)documentCameraViewController:(VNDocumentCameraViewController *)controller
                    didFailWithError:(NSError *)error {
    [controller dismissViewControllerAnimated:true completion:^{
        self.callback(@[@{@"error": @YES, @"errorMessage": error.localizedFailureReason}]);
    }];
}

@end
