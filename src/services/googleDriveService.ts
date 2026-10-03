import { getAccessToken } from './googleAuthService';

export interface GoogleDriveFolder {
  id: string;
  name: string;
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  webContentLink?: string;
  size?: number;
  createdTime?: string;
  parents?: string[];
}

export interface DriveUploadOptions {
  fileName: string;
  folderName?: string;
  folderParentId?: string;
  descriptionDocNo?: string;
}

const ROOT_APP_FOLDER_NAME = 'BTC_Enterprise_Storage';

/**
 * Ensures a directory exists by name inside a parent directory.
 * If not exists, creates it automatically.
 */
export async function getOrCreateDriveFolder(folderName: string, parentFolderId?: string): Promise<string> {
  const token = await getAccessToken();
  if (!token) throw new Error('กรุณาลงชื่อเข้าใช้ด้วยบัญชี Google เพื่อเชื่อมต่อ Google Drive');

  // Search if folder exists
  let query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  if (parentFolderId) {
    query += ` and '${parentFolderId}' in parents`;
  }

  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`;
  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!searchRes.ok) {
    const err = await searchRes.text();
    console.error('[Google Drive] Search folder error:', err);
    throw new Error('ไม่สามารถค้นหาโฟลเดอร์ใน Google Drive ได้: ' + searchRes.statusText);
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create folder if not found
  const createMetadata: Record<string, any> = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder'
  };
  if (parentFolderId) {
    createMetadata.parents = [parentFolderId];
  }

  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(createMetadata)
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    console.error('[Google Drive] Create folder error:', err);
    throw new Error('ไม่สามารถสร้างโฟลเดอร์ใน Google Drive ได้: ' + createRes.statusText);
  }

  const newFolder = await createRes.json();
  return newFolder.id;
}

/**
 * Standardizes file upload to Google Drive with automatic document-based naming:
 * Format: [DocNo]_[FileName]_[Timestamp].[ext]
 */
export async function uploadFileToDrive(
  fileBlob: Blob,
  rawFileName: string,
  docNo?: string,
  subfolderName?: string
): Promise<{ fileId: string; webViewLink: string; webContentLink: string; standardName: string }> {
  const token = await getAccessToken();
  if (!token) throw new Error('กรุณาลงชื่อเข้าใช้ด้วยบัญชี Google เพื่ออัปโหลดไฟล์ไปยัง Drive');

  // 1. Get or create root storage folder
  const rootFolderId = await getOrCreateDriveFolder(ROOT_APP_FOLDER_NAME);
  
  // 2. If subfolder (e.g. Project name or Doc Type) specified, organize inside it
  let targetFolderId = rootFolderId;
  if (subfolderName) {
    targetFolderId = await getOrCreateDriveFolder(subfolderName, rootFolderId);
  }

  // 3. Document-based standardized naming rule
  const cleanDocNo = docNo ? docNo.trim().replace(/[^a-zA-Z0-9_-]/g, '_') : 'DOC';
  const extension = rawFileName.includes('.') ? rawFileName.substring(rawFileName.lastIndexOf('.')) : '';
  const baseName = rawFileName.includes('.') ? rawFileName.substring(0, rawFileName.lastIndexOf('.')) : rawFileName;
  const cleanBaseName = baseName.replace(/[^a-zA-Z0-9_\u0E00-\u0E7F-]/g, '_').substring(0, 40);
  const timeStamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  const standardizedName = `${cleanDocNo}_${cleanBaseName}_${timeStamp}${extension}`;

  const metadata = {
    name: standardizedName,
    parents: [targetFolderId],
    description: `เอกสารแนบอ้างอิงเลขที่: ${docNo || 'ทั่วไป'} | อัปโหลดจากระบบบัญชีก่อสร้าง BTC`
  };

  // Multipart upload
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const mimeType = fileBlob.type || 'application/octet-stream';

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n` +
    'Content-Transfer-Encoding: base64\r\n\r\n';

  // Convert blob to base64
  const arrayBuffer = await fileBlob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64Data = btoa(binary);

  const payload = multipartRequestBody + base64Data + closeDelimiter;

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: payload
    }
  );

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    console.error('[Google Drive] Upload failed:', errText);
    throw new Error('การอัปโหลดไฟล์ไปยัง Google Drive ขัดข้อง: ' + uploadRes.statusText);
  }

  const uploadedFile = await uploadRes.json();
  return {
    fileId: uploadedFile.id,
    webViewLink: uploadedFile.webViewLink,
    webContentLink: uploadedFile.webContentLink || uploadedFile.webViewLink,
    standardName: standardizedName
  };
}

/**
 * Automatically clean up orphaned/removed files from Google Drive (Garbage Collection)
 * Ensures no unused files remain in Drive storage.
 */
export async function deleteFileFromDrive(fileId: string): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) return false;

  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.ok;
  } catch (e) {
    console.error(`[Google Drive Clean-up] Failed to delete file ${fileId}:`, e);
    return false;
  }
}

/**
 * Garbage Collector helper:
 * Compares original attachments before edit vs new attachments after edit,
 * and deletes all files that were removed by the user.
 */
export async function cleanupOrphanedDriveAttachments(
  oldAttachments: Array<{ id: string; url?: string; fileId?: string }>,
  newAttachments: Array<{ id: string; url?: string; fileId?: string }>
): Promise<number> {
  const newIdSet = new Set(newAttachments.map(a => a.id));
  const newFileIdSet = new Set(newAttachments.map(a => a.fileId).filter(Boolean));

  let cleanedCount = 0;
  for (const old of oldAttachments) {
    // If old attachment is not in new list
    if (!newIdSet.has(old.id)) {
      // Determine fileId
      let driveFileId = old.fileId;
      if (!driveFileId && old.url && old.url.includes('drive.google.com')) {
        const match = old.url.match(/[-\w]{25,}/);
        if (match) driveFileId = match[0];
      }

      if (driveFileId) {
        const success = await deleteFileFromDrive(driveFileId);
        if (success) cleanedCount++;
      }
    }
  }

  return cleanedCount;
}
