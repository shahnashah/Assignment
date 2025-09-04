import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export interface SaveShareResult {
  uriOrUrl: string;
  success: boolean;
  message: string;
}

/**
 * Converts Blob to base64 string safely
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URI prefix if present
      const base64 = result.split(',')[1] || result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Main PDF save/share function - robust cross-platform implementation
 */
export async function saveOrSharePdf(pdfBlob: Blob, filename: string = 'wealth-dashboard-report.pdf'): Promise<SaveShareResult> {
  try {
    console.log('Starting PDF save/share process...');
    console.log('Platform:', Capacitor.isNativePlatform() ? Capacitor.getPlatform() : 'web');
    console.log('PDF blob size:', pdfBlob.size, 'bytes');

    if (Capacitor.isNativePlatform()) {
      return await handleMobileSaveShare(pdfBlob, filename);
    } else {
      return await handleWebDownload(pdfBlob, filename);
    }
  } catch (error) {
    console.error('PDF save/share failed:', error);
    return {
      uriOrUrl: '',
      success: false,
      message: `Failed to save PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Web PDF download using URL.createObjectURL
 */
async function handleWebDownload(pdfBlob: Blob, filename: string): Promise<SaveShareResult> {
  try {
    console.log('Starting web PDF download...');
    
    // Create object URL from blob
    const url = URL.createObjectURL(pdfBlob);
    console.log('Created object URL:', url);
    
    // Create and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up object URL after delay
    setTimeout(() => {
      URL.revokeObjectURL(url);
      console.log('Object URL cleaned up');
    }, 1000);
    
    return {
      uriOrUrl: url,
      success: true,
      message: 'PDF downloaded successfully to Downloads folder'
    };
  } catch (error) {
    console.error('Web download failed:', error);
    throw error;
  }
}

/**
 * Mobile PDF save and share using Capacitor Filesystem
 */
async function handleMobileSaveShare(pdfBlob: Blob, filename: string): Promise<SaveShareResult> {
  try {
    console.log('Starting mobile PDF save/share...');
    
    // Convert blob to base64
    const base64Data = await blobToBase64(pdfBlob);
    console.log('Converted to base64, length:', base64Data.length);
    
    // Use Documents directory for both platforms
    const directory = Directory.Documents;
    const filePath = filename;
    
    console.log('Writing file to Documents directory...');
    
    // Write file with base64 encoding
    const writeResult = await Filesystem.writeFile({
      path: filePath,
      data: base64Data,
      directory: directory,
      recursive: false
    });
    
    console.log('File written successfully:', writeResult);
    
    // Get file URI for sharing
    const uriResult = await Filesystem.getUri({
      directory: directory,
      path: filePath
    });
    
    console.log('File URI obtained:', uriResult.uri);
    
    // Attempt to share
    try {
      await Share.share({
        title: 'WealthElite Dashboard Report',
        text: 'Your wealth dashboard report',
        url: uriResult.uri,
        dialogTitle: 'Share PDF Report'
      });
      
      return {
        uriOrUrl: uriResult.uri,
        success: true,
        message: 'PDF saved and shared successfully'
      };
    } catch (shareError) {
      console.log('Share failed, but file saved:', shareError);
      
      return {
        uriOrUrl: uriResult.uri,
        success: true,
        message: 'PDF saved successfully to Documents folder'
      };
    }
  } catch (error) {
    console.error('Mobile save/share failed:', error);
    throw error;
  }
}

/**
 * Save PDF without sharing - for cases where sharing is problematic
 */
export async function saveOnlyPdf(pdfBlob: Blob, filename: string = 'wealth-dashboard-report.pdf'): Promise<SaveShareResult> {
  try {
    if (!Capacitor.isNativePlatform()) {
      return await handleWebDownload(pdfBlob, filename);
    }

    console.log('Starting PDF save-only process...');
    
    // Convert blob to base64
    const base64Data = await blobToBase64(pdfBlob);
    console.log('Converted to base64, length:', base64Data.length);
    
    // Use Documents directory
    const directory = Directory.Documents;
    const filePath = filename;
    
    console.log('Writing file to Documents directory...');
    
    // Write file
    const writeResult = await Filesystem.writeFile({
      path: filePath,
      data: base64Data,
      directory: directory,
      recursive: false
    });
    
    console.log('File written successfully:', writeResult);
    
    return {
      uriOrUrl: writeResult.uri || '',
      success: true,
      message: 'PDF saved successfully to Documents folder'
    };
  } catch (error) {
    console.error('Save-only failed:', error);
    return {
      uriOrUrl: '',
      success: false,
      message: `Save failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Share PDF only without permanent storage - creates temporary file for sharing
 */
export async function shareOnlyPdf(pdfBlob: Blob, filename: string = 'wealth-dashboard-report.pdf'): Promise<SaveShareResult> {
  try {
    if (!Capacitor.isNativePlatform()) {
      return await handleWebDownload(pdfBlob, filename);
    }

    console.log('Starting PDF share-only process...');
    
    // Convert blob to base64
    const base64Data = await blobToBase64(pdfBlob);
    console.log('Converted to base64, length:', base64Data.length);
    
    // Use Cache directory for temporary files
    const directory = Directory.Cache;
    const tempFilePath = `temp_${Date.now()}_${filename}`;
    
    console.log('Creating temporary file:', tempFilePath);
    
    // Write temporary file
    const writeResult = await Filesystem.writeFile({
      path: tempFilePath,
      data: base64Data,
      directory: directory,
      recursive: false
    });
    
    console.log('Temporary file created:', writeResult);
    
    // Get file URI
    const uriResult = await Filesystem.getUri({
      directory: directory,
      path: tempFilePath
    });
    
    console.log('File URI obtained:', uriResult.uri);
    
    try {
      // Share the file
      await Share.share({
        title: 'WealthElite Dashboard Report',
        text: 'Your wealth dashboard report',
        url: uriResult.uri,
        dialogTitle: 'Share PDF Report'
      });
      
      // Clean up after delay
      setTimeout(async () => {
        try {
          await Filesystem.deleteFile({
            path: tempFilePath,
            directory: directory
          });
          console.log('Temporary file cleaned up');
        } catch (cleanupError) {
          console.warn('Cleanup failed:', cleanupError);
        }
      }, 5000);
      
      return {
        uriOrUrl: uriResult.uri,
        success: true,
        message: 'PDF shared successfully'
      };
    } catch (shareError) {
      console.log('Share failed:', shareError);
      
      // Clean up temp file
      try {
        await Filesystem.deleteFile({
          path: tempFilePath,
          directory: directory
        });
      } catch (cleanupError) {
        console.warn('Cleanup failed:', cleanupError);
      }
      
      return {
        uriOrUrl: '',
        success: false,
        message: shareError.message?.includes('cancelled') ? 'Sharing cancelled' : 'Share failed'
      };
    }
  } catch (error) {
    console.error('Share-only failed:', error);
    return {
      uriOrUrl: '',
      success: false,
      message: `Share failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
