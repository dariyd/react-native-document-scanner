// DocumentScanner.mm

#import "DocumentScanner.h"
#import "VisionKit/VisionKit.h"
#import "VisionKit/VNDocumentCameraViewController.h"
#import <React/RCTUtils.h>
#import <ImageIO/ImageIO.h>
#import <CoreLocation/CoreLocation.h>
#import <MobileCoreServices/MobileCoreServices.h>
#import <UIKit/UIKit.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <RNDocumentScannerSpec/RNDocumentScannerSpec.h>
using namespace facebook::react;
#endif

@interface DocumentScanner ()

@property (nonatomic, strong) RCTResponseSenderBlock callback;
@property (nonatomic, copy) NSDictionary *options;
@property (nonatomic, strong) CLLocationManager *locationManager;
@property (nonatomic, strong) CLLocation *currentLocation;
@property (nonatomic, copy) void (^locationCompletion)(CLLocation * _Nullable);
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
- (std::shared_ptr<TurboModule>)getTurboModule:(const ObjCTurboModule::InitParams &)params
{
    return std::make_shared<NativeDocumentScannerSpecJSI>(params);
}

// New architecture method (implements the protocol)
- (void)launchScanner:(JS::NativeDocumentScanner::Options &)options
             callback:(RCTResponseSenderBlock)callback
{
    // Convert C++ struct to NSDictionary
    NSMutableDictionary *opts = [NSMutableDictionary new];
    if (options.quality().has_value()) {
        opts[@"quality"] = @(options.quality().value());
    }
    if (options.includeBase64().has_value()) {
        opts[@"includeBase64"] = @(options.includeBase64().value());
    }
    if (options.includeExif().has_value()) {
        opts[@"includeExif"] = @(options.includeExif().value());
    }
    if (options.includeLocationExif().has_value()) {
        opts[@"includeLocationExif"] = @(options.includeLocationExif().value());
    }

    dispatch_async(dispatch_get_main_queue(), ^{
        [self launchDocScanner:opts callback:callback];
    });
}
#else
// Old architecture method
RCT_EXPORT_METHOD(launchScanner:(NSDictionary *)options callback:(RCTResponseSenderBlock)callback)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        [self launchDocScanner:options callback:callback];
    });
}
#endif

- (void)launchDocScanner:(NSDictionary *)options callback:(RCTResponseSenderBlock)callback
{
    self.callback = callback;
    self.options = options;
    self.currentLocation = nil;

    BOOL includeLocationExif = [options[@"includeLocationExif"] boolValue];

    if (includeLocationExif) {
        [self requestLocationWithCompletion:^(CLLocation * _Nullable location) {
            self.currentLocation = location;
            dispatch_async(dispatch_get_main_queue(), ^{
                [self presentScanner];
            });
        }];
    } else {
        [self presentScanner];
    }
}

- (void)presentScanner
{
    VNDocumentCameraViewController *scanner = [[VNDocumentCameraViewController alloc] init];
    scanner.delegate = self;
    [RCTPresentedViewController() presentViewController:scanner animated:YES completion:nil];
}

#pragma mark - Location

- (void)requestLocationWithCompletion:(void (^)(CLLocation * _Nullable))completion
{
    self.locationCompletion = completion;

    if (!self.locationManager) {
        self.locationManager = [[CLLocationManager alloc] init];
        self.locationManager.delegate = self;
        self.locationManager.desiredAccuracy = kCLLocationAccuracyBest;
    }

    CLAuthorizationStatus status;
    if (@available(iOS 14.0, *)) {
        status = self.locationManager.authorizationStatus;
    } else {
        status = [CLLocationManager authorizationStatus];
    }

    if (status == kCLAuthorizationStatusNotDetermined) {
        [self.locationManager requestWhenInUseAuthorization];
    } else if (status == kCLAuthorizationStatusAuthorizedWhenInUse ||
               status == kCLAuthorizationStatusAuthorizedAlways) {
        [self.locationManager requestLocation];
    } else {
        // Permission denied — skip GPS
        if (self.locationCompletion) {
            self.locationCompletion(nil);
            self.locationCompletion = nil;
        }
    }
}

- (void)locationManager:(CLLocationManager *)manager didChangeAuthorizationStatus:(CLAuthorizationStatus)status
{
    if (status == kCLAuthorizationStatusAuthorizedWhenInUse ||
        status == kCLAuthorizationStatusAuthorizedAlways) {
        [self.locationManager requestLocation];
    } else if (status != kCLAuthorizationStatusNotDetermined) {
        // Denied or restricted — skip GPS
        if (self.locationCompletion) {
            self.locationCompletion(nil);
            self.locationCompletion = nil;
        }
    }
}

- (void)locationManager:(CLLocationManager *)manager didUpdateLocations:(NSArray<CLLocation *> *)locations
{
    if (self.locationCompletion) {
        self.locationCompletion(locations.lastObject);
        self.locationCompletion = nil;
    }
}

- (void)locationManager:(CLLocationManager *)manager didFailWithError:(NSError *)error
{
    if (self.locationCompletion) {
        self.locationCompletion(nil);
        self.locationCompletion = nil;
    }
}

#pragma mark - EXIF

- (NSDictionary *)buildExifDictionaryForImage:(UIImage *)image
{
    NSMutableDictionary *exifDict = [NSMutableDictionary dictionary];

    // Timestamps
    NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
    formatter.dateFormat = @"yyyy:MM:dd HH:mm:ss";
    NSString *dateString = [formatter stringFromDate:[NSDate date]];
    exifDict[(__bridge NSString *)kCGImagePropertyExifDateTimeOriginal] = dateString;
    exifDict[(__bridge NSString *)kCGImagePropertyExifDateTimeDigitized] = dateString;

    // Dimensions
    exifDict[(__bridge NSString *)kCGImagePropertyExifPixelXDimension] = @((int)image.size.width);
    exifDict[(__bridge NSString *)kCGImagePropertyExifPixelYDimension] = @((int)image.size.height);

    // Color space
    exifDict[(__bridge NSString *)kCGImagePropertyExifColorSpace] = @1; // sRGB

    // User comment
    exifDict[(__bridge NSString *)kCGImagePropertyExifUserComment] = @"Document scan";

    return exifDict;
}

- (NSDictionary *)buildTiffDictionary
{
    NSMutableDictionary *tiffDict = [NSMutableDictionary dictionary];

    NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
    formatter.dateFormat = @"yyyy:MM:dd HH:mm:ss";
    tiffDict[(__bridge NSString *)kCGImagePropertyTIFFDateTime] = [formatter stringFromDate:[NSDate date]];
    tiffDict[(__bridge NSString *)kCGImagePropertyTIFFMake] = @"Apple";
    tiffDict[(__bridge NSString *)kCGImagePropertyTIFFModel] = [[UIDevice currentDevice] model];
    tiffDict[(__bridge NSString *)kCGImagePropertyTIFFSoftware] = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleName"] ?: @"DocumentScanner";

    return tiffDict;
}

- (NSDictionary *)buildGpsDictionaryFromLocation:(CLLocation *)location
{
    if (!location) return nil;

    NSMutableDictionary *gpsDict = [NSMutableDictionary dictionary];

    double latitude = location.coordinate.latitude;
    double longitude = location.coordinate.longitude;

    gpsDict[(__bridge NSString *)kCGImagePropertyGPSLatitude] = @(fabs(latitude));
    gpsDict[(__bridge NSString *)kCGImagePropertyGPSLatitudeRef] = latitude >= 0 ? @"N" : @"S";
    gpsDict[(__bridge NSString *)kCGImagePropertyGPSLongitude] = @(fabs(longitude));
    gpsDict[(__bridge NSString *)kCGImagePropertyGPSLongitudeRef] = longitude >= 0 ? @"E" : @"W";

    gpsDict[(__bridge NSString *)kCGImagePropertyGPSAltitude] = @(fabs(location.altitude));
    gpsDict[(__bridge NSString *)kCGImagePropertyGPSAltitudeRef] = @(location.altitude < 0 ? 1 : 0);

    // GPS timestamp (UTC)
    NSDateFormatter *timeFormatter = [[NSDateFormatter alloc] init];
    timeFormatter.dateFormat = @"HH:mm:ss.SSSSSS";
    timeFormatter.timeZone = [NSTimeZone timeZoneWithName:@"UTC"];
    gpsDict[(__bridge NSString *)kCGImagePropertyGPSTimeStamp] = [timeFormatter stringFromDate:location.timestamp];

    NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
    dateFormatter.dateFormat = @"yyyy:MM:dd";
    dateFormatter.timeZone = [NSTimeZone timeZoneWithName:@"UTC"];
    gpsDict[(__bridge NSString *)kCGImagePropertyGPSDateStamp] = [dateFormatter stringFromDate:location.timestamp];

    if (location.horizontalAccuracy >= 0) {
        gpsDict[(__bridge NSString *)kCGImagePropertyGPSHPositioningError] = @(location.horizontalAccuracy);
    }

    return gpsDict;
}

- (NSData *)imageDataWithExif:(UIImage *)image fileType:(NSString *)fileType
{
    CGImageRef cgImage = image.CGImage;
    if (!cgImage) return nil;

    NSMutableData *data = [NSMutableData data];

    CFStringRef uti = [fileType isEqualToString:@"png"] ?
        (__bridge CFStringRef)@"public.png" :
        (__bridge CFStringRef)@"public.jpeg";

    CGImageDestinationRef dest = CGImageDestinationCreateWithData(
        (__bridge CFMutableDataRef)data,
        uti,
        1,
        NULL
    );
    if (!dest) return nil;

    NSMutableDictionary *properties = [NSMutableDictionary dictionary];

    // EXIF dictionary
    properties[(__bridge NSString *)kCGImagePropertyExifDictionary] = [self buildExifDictionaryForImage:image];

    // TIFF dictionary
    properties[(__bridge NSString *)kCGImagePropertyTIFFDictionary] = [self buildTiffDictionary];

    // GPS dictionary (if location available)
    if (self.currentLocation) {
        NSDictionary *gpsDict = [self buildGpsDictionaryFromLocation:self.currentLocation];
        if (gpsDict) {
            properties[(__bridge NSString *)kCGImagePropertyGPSDictionary] = gpsDict;
        }
    }

    // Set JPEG compression quality
    if ([fileType isEqualToString:@"jpg"]) {
        float quality = [self.options[@"quality"] floatValue];
        properties[(__bridge NSString *)kCGImageDestinationLossyCompressionQuality] = @(quality);
    }

    CGImageDestinationAddImage(dest, cgImage, (__bridge CFDictionaryRef)properties);
    CGImageDestinationFinalize(dest);
    CFRelease(dest);

    return data;
}

- (NSDictionary *)exifResponseDictionary:(UIImage *)image
{
    NSMutableDictionary *exifResponse = [NSMutableDictionary dictionary];

    // EXIF fields
    NSDictionary *exifDict = [self buildExifDictionaryForImage:image];
    [exifResponse addEntriesFromDictionary:exifDict];

    // TIFF fields
    NSDictionary *tiffDict = [self buildTiffDictionary];
    exifResponse[@"Make"] = tiffDict[(__bridge NSString *)kCGImagePropertyTIFFMake];
    exifResponse[@"Model"] = tiffDict[(__bridge NSString *)kCGImagePropertyTIFFModel];
    exifResponse[@"Software"] = tiffDict[(__bridge NSString *)kCGImagePropertyTIFFSoftware];

    // GPS fields
    if (self.currentLocation) {
        CLLocationCoordinate2D coord = self.currentLocation.coordinate;
        exifResponse[@"GPSLatitude"] = @(coord.latitude);
        exifResponse[@"GPSLongitude"] = @(coord.longitude);
        exifResponse[@"GPSAltitude"] = @(self.currentLocation.altitude);
        exifResponse[@"GPSHorizontalAccuracy"] = @(self.currentLocation.horizontalAccuracy);

        NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
        formatter.dateFormat = @"yyyy:MM:dd HH:mm:ss";
        formatter.timeZone = [NSTimeZone timeZoneWithName:@"UTC"];
        exifResponse[@"GPSDateTimeUTC"] = [formatter stringFromDate:self.currentLocation.timestamp];
    }

    return exifResponse;
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
    NSString *fileType = self.options[@"quality"] != nil && [self.options[@"quality"] floatValue] < 1.0 ? @"jpg" : @"png";
    BOOL includeExif = [self.options[@"includeExif"] boolValue];
    NSData *data = nil;

    if (includeExif) {
        // Use ImageIO to write image with EXIF metadata embedded
        data = [self imageDataWithExif:image fileType:fileType];
    }

    // Fallback to standard encoding if EXIF writing failed or not requested
    if (!data) {
        if ([fileType isEqualToString:@"jpg"]) {
            data = UIImageJPEGRepresentation(image, [self.options[@"quality"] floatValue]);
        } else if ([fileType isEqualToString:@"png"]) {
            data = UIImagePNGRepresentation(image);
        }
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

    // Include EXIF data in response
    if (includeExif) {
        asset[@"exif"] = [self exifResponseDictionary:image];
    }

    return asset;
}

- (void)imagePickerControllerDidCancel:(UIImagePickerController *)picker
{
    dispatch_async(dispatch_get_main_queue(), ^{
        [picker dismissViewControllerAnimated:YES completion:^{
            self.callback(@[@{ @"didCancel": @YES }]);
        }];
    });
}

- (void)documentCameraViewController:(VNDocumentCameraViewController *)controller didFinishWithScan:(VNDocumentCameraScan *)scan{
    NSMutableArray *scannedImages = [NSMutableArray array];
    for (int i = 0; i < [scan pageCount]; i++) {
        UIImage *image =  [scan imageOfPageAtIndex:i];
        [scannedImages addObject:[self mapImageToAsset:image]];
    }

    [controller dismissViewControllerAnimated:true completion:^{
        self.callback(@[@{ @"images": scannedImages }]);
    }];
}

- (void)documentCameraViewControllerDidCancel:(VNDocumentCameraViewController *)controller {
    [controller dismissViewControllerAnimated:true completion:^{
        self.callback(@[@{ @"didCancel": @YES }]);
    }];
}

- (void)documentCameraViewController:(VNDocumentCameraViewController *)controller didFailWithError:(NSError *)error {
    [controller dismissViewControllerAnimated:true completion:^{
        self.callback(@[@{ @"error": @YES, @"errorMessage": error.localizedFailureReason ?: error.localizedDescription }]);
    }];
}

@end
