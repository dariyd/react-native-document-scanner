# react-native-document-scanner (only IOS now)
This is a React Native module to use ios VisinKit framework and VNDocumentScanner to scan documents
## Getting started

`$ yarn add https://github.com/dariyd/react-native-document-scanner.git`

### automatic installation

`$ cd ios && pod install`

## Post-install Steps

### iOS

Add the `NSCameraUsageDescription` key to your Info.plist,


## Usage
```javascript
import { launchScanner } from 'react-native-document-scanner';

const results = await launchScanner(options?);
```
# API Reference

## Methods

```js
import {launchScanner} from 'react-native-document-scanner';
```

### `launchScanner()`

Launch scanner to scan documents.

See [Options](#options) for further information on `options`.

The `callback` will be called with a response object, refer to [The Response Object](#the-response-object).

See [Options](#options) for further information on `options`.

The `callback` will be called with a response object, refer to [The Response Object](#the-response-object).

## Options

| Option         | iOS | Description                                                                                                                               |
| -------------- | --- |----------------------------------------------------------------------------------------------------------------------------------------- |
| quality        | OK  |0 to 1, 
| includeBase64  | OK  |If true, creates base64 string of the image (Avoid using on large image files due to performance)                                         |                                                   |

## The Response Object

| key          | iOS |Description                                                         |
| ------------ | --- |------------------------------------------------------------------- |
| didCancel    | OK  |`true` if the user cancelled the process                            |
| error        | OK  |`true` if error happens                |
| errorMessage | OK  |Description of the error, use it for debug purpose only             |
| images       | OK  |Array of the selected media, [refer to Image Object](#Image-Object) |

## Image Object

| key       | iOS | Description               |
| --------- | --- | ------------------------- |
| base64    | OK  | The base64 string of the image |
| uri       | OK  | The file uri in app specific cache storage
| width     | OK  | Image dimensions                |
| height    | OK  | Image dimensions                |
| fileSize  | OK  | The file size                                 |
| type      | OK  | The file type                                 |
| fileName  | OK  | The file name                                 |

## Inspired By

- for iOS : [react-native-image-picker](https://github.com/react-native-image-picker/react-native-image-picker)