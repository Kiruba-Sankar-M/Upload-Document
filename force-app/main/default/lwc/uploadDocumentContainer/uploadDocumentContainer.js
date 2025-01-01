import { LightningElement, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';

export default class UploadDocumentContainer extends LightningElement {

    @track documentProperties = {
        required: false,
        label : 'Recent Passport Photo',
        saveDocumentNameAs: 'Passport Photo',
        helptext: '',
        maxFileSize : 1 , //in MB
        allowedFormats: '.jpg, .png',
        disabled: false,
        contentDocumentId: '',
        contentVersionId: '',
        allowPreview : true,
        allowDownload: true,
        allowDelete: true,
        parentId: '',
        isOverrideExistingFile: true,
        isModifyImageProperties: true,
        resizeMode: 'contain',// Options: 'fill', 'contain', 'none'
        resizeStrategy: 'reduce', // Options: 'reduce', 'enlarge', 'always'
        targetWidth: 400, // Target width in pixels
        targetHeight: 300, // Target height in pixels
        compressionQuality: 0.8, // Compression quality (0-1)
        imageSmoothingEnabled: false, // Enable/disable image smoothing
        preserveTransparency: false
        
    }

        
       

    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference) {
            this.documentProperties = {...this.documentProperties , parentId : currentPageReference.state.recordId} 
        }
    }

    handleFileDelete(event) {
        let { contentDocumentId, contentVersionId , label} = event.detail;
        //Process as per your requirement

    }

    handleFileUpload(event) {
        let { contentDocumentId, contentVersionId ,label } = event.detail;
      //Process as per your requirement
    }

    
}