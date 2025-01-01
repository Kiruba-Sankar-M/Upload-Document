import { LightningElement, api } from 'lwc';
import uploadAttachment from '@salesforce/apex/DocumentUploadService.uploadAttachment';
import LightningConfirm from 'lightning/confirm';
import deleteContentDocument from '@salesforce/apex/DocumentUploadService.deleteContentDocument';
import { generateUrl } from "lightning/fileDownload";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { processImage } from 'lightning/mediaUtils';

export default class UploadDocument extends LightningElement {
    
    documentPreviewURL;
    showModal;
    isSpinner;
    fileFormat;

    @api required = false;
    @api label = 'Document';
    @api saveDocumentNameAs = '';
    @api helptext = '';
    @api maxFileSize = 1 // in MB;
    @api allowedFormats = '.jpg, .png';
    @api disabled = false;
    @api contentDocumentId = '';
    @api contentVersionId = '';
    @api allowPreview = false;
    @api allowDownload = false;
    @api allowDelete = false;
    @api parentId = '';
    @api isOverrideExistingFile = false;

    @api isModifyImageProperties = false;
    @api resizeMode = 'contain'; // Options: 'fill', 'contain', 'none'
    @api resizeStrategy = 'reduce'; // Options: 'reduce', 'enlarge', 'always'
    @api targetWidth = 800; // Target width in pixels
    @api targetHeight = 600; // Target height in pixels
    @api compressionQuality = 0.8; // Compression quality (0-1)
    @api imageSmoothingEnabled = false; // Enable/disable image smoothing
    @api preserveTransparency = false; // Preserve image transparency

    handlePreview() {
        this.documentPreviewURL = this.generatePreviewSrc();
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }

    handleDownload() {
        const url = generateUrl(this.contentDocumentId);
        window.open(url);
    }

    generatePreviewSrc() {
        let srcUrl = '/sfc/servlet.shepherd/version/renditionDownload?';

        if (this.fileFormat === 'docx' || this.fileFormat === 'pdf') {
            srcUrl += `rendition=THUMB720BY480&versionId=${this.contentVersionId}`;
        } else {
            srcUrl += `rendition=ORIGINAL_Jpg&versionId=${this.contentVersionId}`;
        }
        return srcUrl;
    }

    async uploadFileHandler(event) {

        const files = event.target.files;
       
        // Validate file size
        if (files.length > 1) {
            this.showToastMessage('data', null, '', `You are trying to upload ${files.length}, please do upload 1 file`, 'error');
            return;
        }
        
        const file = files[0];
        let documentName = file.name; // Assuming you are passing the index of document via data attribute
        documentName = this.saveDocumentNameAs || documentName;
        const fileSizeMB = file.size / (1024 * 1024);
        
        if (fileSizeMB > this.maxFileSize ) {
            this.showToastMessage('data', null, '', `You are trying to upload a file of ${fileSizeMB.toFixed(2)} MB, but the max file size allowed is ${this.maxFileSize} MB.`, 'error');
            return;
        }

        // Validate file format
        const fileFormat = file.name.split('.').pop().toLowerCase();
        this.fileFormat = fileFormat;
        if (!this.allowedFormats?.includes(`.${fileFormat}`)) {
            this.showToastMessage('data', null, '', `Allowed file formats are: ${this.allowedFormats}, but are trying to upload a .${fileFormat} file.`, 'error');
            return;
        }

        this.isSpinner = true;

        try {
            const processedFile = await this.processUploadedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result.split(',')[1];
                const documentTitle = `${documentName}.${fileFormat}`;

                uploadAttachment({ documentName, documentTitle, fileData: base64, recordId: this.parentId, isOverrideExistingFile: this.isOverrideExistingFile })
                    .then((result) => {
                        const { contentDocumentId, contentVersionId } = result;
                        this.contentDocumentId = contentDocumentId;
                        this.contentVersionId = contentVersionId;
                        this.dispatchEventToParent('upload');
                        this.showToastMessage('data', null, '', `${this.label} uploaded successfully`, 'success');
                    })
                    .catch((error) => {
                        this.showToastMessage('error', error, `Error uploading ${this.label}`, '', 'error');
                    })
                    .finally(() => (this.isSpinner = false));
            };
            reader.readAsDataURL(processedFile);
        } catch (error) {
            this.showToastMessage('error', error, 'Error processing image', '', 'error');
            this.isSpinner = false;
        }
        /* const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result.split(',')[1]; 
            uploadAttachment({ documentName: documentName, documentTitle, fileData: base64, recordId: this.parentId, isOverrideExistingFile : this.isOverrideExistingFile })
                .then(result => {
                    let { contentDocumentId, contentVersionId } = result
                    this.contentDocumentId = contentDocumentId;
                    this.contentVersionId = contentVersionId;
                    this.dispatchEventToParent('upload');
                    this.showToastMessage('data', null, '', `${this.label} uploaded successfully`, 'success');
                }).catch(error => {
                    this.showToastMessage('error', error, `Error uploading ${this.label}`, '', 'error');
                }).finally(() => this.isSpinner = false);
        };
        reader.readAsDataURL(file);  */
    }


    async handleDelete(event) {
        let documentName = event.target.name;
       
        const result = await this.handleConfirmClick(documentName);
        this.isSpinner = true;
        if (result) {
            deleteContentDocument({ contentDocumentId: this.contentDocumentId }).then(() => {
                this.dispatchEventToParent('delete');
                this.contentDocumentId = '';
                this.contentVersionId = '';
                this.showToastMessage('data', null, '', `${documentName} deleted successfully`, 'success');
            }).catch(error => {
                this.showToastMessage('error', error, `Error deleting ${documentName}`, '', 'error');
            }).finally(() => this.isSpinner = false);
        }
    }

    async processUploadedFile(file) {
        if (this.isModifyImageProperties && file.type?.startsWith('image/')) {
            return await processImage(file, {
                resizeMode: this.resizeMode,
                resizeStrategy: this.resizeStrategy,
                targetWidth: this.targetWidth,
                targetHeight: this.targetHeight,
                compressionQuality: this.compressionQuality,
                imageSmoothingEnabled: this.imageSmoothingEnabled,
                preserveTransparency: this.preserveTransparency,
            });
        }
        return file; // Return the original file if not an image
    }

    dispatchEventToParent(eventType) {
        this.dispatchEvent(new CustomEvent(eventType, {
            detail: {
                contentDocumentId : this.contentDocumentId,
                contentVersionId : this.contentVersionId,
                label : this.label
            }
        }))
    }

    async handleConfirmClick(documentName) {
        documentName = documentName || 'document';
        return await LightningConfirm.open({
            message: `Are you sure you want to delete the uploaded ${documentName}.`,
            variant: 'default',
            label: 'Confirmation for deleting uploaded file',
        });
    }
    
    showToastMessage(dataOrError, property, title, message, variant) {
        if (dataOrError === "data") {
            this.handleSuccess(title, message, variant);
        } else if (dataOrError === "error") {
            this.handleError(property, title);
        }
    }

     handleSuccess(title, message, variant = "success") {
        this.dispatchToastMessage(title, message, variant);
    }


    handleError(error, title) {
        let message = "Unknown error";
        if (error && Array.isArray(error.body)) {
            message = error.body.map((e) => e.message).join(", ");
        } else if (error && typeof error.body.message === "string") {
            message = error.body.message;
        }
        this.dispatchToastMessage(title, message, "error");
    }

    dispatchToastMessage(title, message, variant = 'info', mode = 'dismissable') {
        const toastEvent = new ShowToastEvent({
            title,
            message,
            variant, // Variant can be 'info', 'success', 'warning', or 'error'
            mode // Mode can be 'dismissable', 'sticky', or 'pester'
        });
        this.dispatchEvent(toastEvent);
    }

}