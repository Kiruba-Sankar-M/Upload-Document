# UploadDocument LWC Documentation

## Overview
`UploadDocument` is a reusable Lightning Web Component (LWC) designed to provide robust file upload functionality with additional features like file preview, download, delete, and image modification. The component is highly customizable through public properties and supports parent-child interaction via custom events.

## Key Features
- File upload with size and format validation.
- Optional image modification using `lightning/mediaUtils`.
- Preview of uploaded documents.
- File download capability.
- File delete functionality with confirmation.
- Support for passing properties via `lwc:spread` for seamless integration with parent components.

## Public Properties
The following properties can be configured in the parent component and passed to the `UploadDocument` component:

| Property Name             | Type      | Default Value         | Description |
|---------------------------|-----------|-----------------------|-------------|
| `required`                | Boolean   | `false`               | Marks the upload as mandatory. |
| `label`                   | String    | `'Document'`          | Label for the file upload field. |
| `saveDocumentNameAs`      | String    | `''`                  | Custom name to save the uploaded document. |
| `helptext`                | String    | `''`                  | Help text displayed near the file upload field. |
| `maxFileSize`             | Number    | `1`                   | Maximum file size allowed (in MB). |
| `allowedFormats`          | String    | `'.jpg, .png'`        | Allowed file formats, separated by commas. |
| `disabled`                | Boolean   | `false`               | Disables the file upload field. |
| `contentDocumentId`       | String    | `''`                  | ID of the uploaded content document. |
| `contentVersionId`        | String    | `''`                  | ID of the uploaded content version. |
| `allowPreview`            | Boolean   | `false`               | Enables document preview functionality. |
| `allowDownload`           | Boolean   | `false`               | Enables document download functionality. |
| `allowDelete`             | Boolean   | `false`               | Enables document delete functionality. |
| `parentId`                | String    | `''`                  | ID of the parent record to associate the uploaded file. |
| `isOverrideExistingFile`  | Boolean   | `false`               | Allows overriding an existing file. |
| `isModifyImageProperties` | Boolean   | `false`               | Enables image modification for uploaded files. |
| `resizeMode`              | String    | `'fill'`              | Specifies how the image will be resized. Options: `'fill'`, `'contain'`, `'none'`. |
| `resizeStrategy`          | String    | `'always'`            | Determines when resizing occurs. Options: `'reduce'`, `'enlarge'`, `'always'`. |
| `targetWidth`             | Number    | `''`                  | Target width for image resizing (in pixels). |
| `targetHeight`            | Number    | `''`                  | Target height for image resizing (in pixels). |
| `compressionQuality`      | Number    | `''`                  | Compression quality for the image (range: 0-1). |
| `imageSmoothingEnabled`   | Boolean   | `true`                | Enables image smoothing during resizing. |
| `preserveTransparency`    | Boolean   | `true`                | Preserves transparency in the image. |

## Events
### `upload`
Triggered after a file is successfully uploaded.
#### Event Detail
```json
{
  "contentDocumentId": "<ID>",
  "contentVersionId": "<ID>",
  "label": "<Label>"
}
```
#### Example:
```html
<c-upload-document lwc:spread={documentProperties}
                    onupload={handleFileUpload}></c-upload-document>
```
```javascript
handleFileUpload(event) {
    console.log('File uploaded:', event.detail);
}
```

### `delete`
Triggered after a file is successfully deleted.
#### Event Detail
```json
{
  "contentDocumentId": "<ID>",
  "contentVersionId": "<ID>",
  "label": "<Label>"
}
```
#### Example:
```html
<c-upload-document lwc:spread={documentProperties}
                    ondelete={handleFileDelete}></c-upload-document>
```
```javascript
handleFileDelete(event) {
    console.log('File deleted:', event.detail);
}
```

## Usage in Parent Component
To use the `UploadDocument` component in a parent component, define the properties as an object and pass them using `lwc:spread`:

### Parent Component JS
```javascript
import { LightningElement, track } from 'lwc';

export default class ParentComponent extends LightningElement {
    @track documentProperties = {
        required: false,
        label: 'Recent Passport Photo',
        saveDocumentNameAs: 'Passport Photo',
        helptext: '',
        maxFileSize: 1, // in MB
        allowedFormats: '.jpg, .png',
        disabled: false,
        contentDocumentId: '',
        contentVersionId: '',
        allowPreview: true,
        allowDownload: true,
        allowDelete: true,
        parentId: '',
        isOverrideExistingFile: true,
        isModifyImageProperties: true,
        resizeMode: 'contain', // Options: 'fill', 'contain', 'none'
        resizeStrategy: 'reduce', // Options: 'reduce', 'enlarge', 'always'
        targetWidth: 400, // Target width in pixels
        targetHeight: 300, // Target height in pixels
        compressionQuality: 0.8, // Compression quality (0-1)
        imageSmoothingEnabled: false, // Enable/disable image smoothing
        preserveTransparency: false
    };

    handleFileUpload(event) {
        console.log('File uploaded:', event.detail);
    }

    handleFileDelete(event) {
        console.log('File deleted:', event.detail);
    }
}
```

### Parent Component HTML
```html
<c-upload-document lwc:spread={documentProperties}
                    onupload={handleFileUpload}
                    ondelete={handleFileDelete}></c-upload-document>
```

## Additional Notes
- The `processImage` function from `lightning/mediaUtils` is used for modifying images when `isModifyImageProperties` is enabled. If the uploaded file is not an image, it is processed as is.
- The component ensures file size and format validation before initiating the upload.
- File delete functionality includes a confirmation prompt.
- Document preview URLs are dynamically generated based on file type.
- Lightning Media Util documentation : https://developer.salesforce.com/docs/component-library/bundle/lightning-media-utils/documentation

This documentation provides all the necessary details to configure and integrate the `UploadDocument` component effectively into your Salesforce project.

