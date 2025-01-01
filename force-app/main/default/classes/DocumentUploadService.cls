public without sharing class DocumentUploadService {
    @AuraEnabled
	public static Map<String, String> uploadAttachment(String documentName, String documentTitle, String fileData, String recordId, Boolean isOverrideExistingFile ) {
		
        // Check if a file with the same name and linked to the record already exists
       String query = 'SELECT Id, ContentDocumentId ' +
                   'FROM ContentVersion ' +
                   'WHERE FirstPublishLocationId =: recordId '+  
                   ' AND Title LIKE \'%' + String.escapeSingleQuotes(documentName) + '%\' ' +
                   'ORDER BY CreatedDate DESC ' +
                   'LIMIT 1';
                
		Map<String, String> result = new Map<String, String>();
		List<ContentVersion> existingContentVersion = Database.query(query);

		if (!existingContentVersion.isEmpty() && isOverrideExistingFile) {
			result = updateExistingContentVersion(documentName, documentTitle, existingContentVersion[0].Id, fileData);
		} else {
			result = createNewContentVersion(documentName, documentTitle, fileData, recordId);
		}
		return result ;
	}

	private static Map<String, String> createNewContentVersion(String documentName, String documentTitle, String fileData, Id recordId) {
		ContentVersion newContentVersion = new ContentVersion();
		newContentVersion.Title = documentTitle;
		newContentVersion.VersionData = EncodingUtil.base64Decode(fileData);
		newContentVersion.PathOnClient = documentTitle; // Set this to the desired file name
		newContentVersion.FirstPublishLocationId = recordId; // Link to the record
        newContentVersion.Document_Name__c = documentName;
		insert newContentVersion;
		ContentVersion cv = [SELECT Id, ContentDocumentId FROM ContentVersion WHERE Id =: newContentVersion.Id AND IsLatest = TRUE];
		Map<String, String> result = new Map<String, String>();
		result.put('contentVersionId' , cv.Id);
		result.put('contentDocumentId' ,cv.ContentDocumentId);
		return result;
	}

	
	private static Map<String, String> updateExistingContentVersion(String documentName, String documentTitle, Id contentVersionId, String fileData) {
        System.debug('Entering updateExistingContentVersion');

		List<ContentVersion> existingContentVersion = [
			SELECT Id, ContentDocumentId, Title
			FROM ContentVersion
			WHERE Id = :contentVersionId
			LIMIT 1
		];

		if (!existingContentVersion.isEmpty()) {
			// Create a new version by inserting a new ContentVersion record
			ContentVersion newVersion = new ContentVersion();
			newVersion.Title = documentTitle;
			newVersion.VersionData = EncodingUtil.base64Decode(fileData);
			newVersion.PathOnClient = documentTitle;
			newVersion.ContentDocumentId = existingContentVersion[0].ContentDocumentId;
            newVersion.Document_Name__c = documentName;
			insert newVersion;
			ContentVersion cv = [SELECT Id, ContentDocumentId FROM ContentVersion WHERE Id =: newVersion.Id AND IsLatest = TRUE];
			Map<String, String> result = new Map<String, String>();
			result.put('contentVersionId' , cv.Id);
			result.put('contentDocumentId' ,cv.ContentDocumentId);
			return result;
		}
		return NULL;
	}

	@AuraEnabled
	public static void deleteContentDocument(String contentDocumentId){
		delete [SELECT Id FROM ContentDocument Where Id =: contentDocumentId];
	}
   
}