import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export interface SaveShareResult {
  uriOrUrl: string;
  success: boolean;
  message: string;
}

/**
 * Saves and shares a PDF file using native capabilities on mobile or web fallback
 * @param base64 - Base64 encoded PDF data
 * @param filename - Optional filename (defaults to timestamped name)
 */
export async function saveOrSharePdf(base64: string, filename: string = 'wealth-dashboard-report.pdf'): Promise<SaveShareResult> {
  // Check if we're on a native platform (iOS/Android)
  if (Capacitor.isNativePlatform()) {
    return await handleNativeSaveShare(base64, filename);
  } else {
    // Fallback to web download
    return await handleWebFallback(base64, filename);
  }
}

/**
 * Save PDF without sharing - for cases where sharing is problematic
 */
export async function saveOnlyPdf(base64: string, filename: string = 'wealth-dashboard-report.pdf'): Promise<SaveShareResult> {
  if (!Capacitor.isNativePlatform()) {
    return await handleWebFallback(base64, filename);
  }

  try {
    console.log('Starting PDF save process...');
    const platform = Capacitor.getPlatform();
    console.log('Platform detected:', platform);
    
    // Use Documents directory for both iOS and Android for better compatibility
    const directory = Directory.Documents;
    const filePath = `WealthElite/${filename}`;
    
    console.log('Attempting to write file to:', filePath, 'in directory:', directory);
    console.log('Base64 data length:', base64.length);
    
    // Validate base64 data
    if (!base64 || base64.length === 0) {
      throw new Error('Invalid base64 data: empty or null');
    }
    
    // Write the file to the device (base64 data is handled automatically)
    const writeResult = await Filesystem.writeFile({
      path: filePath,
      data: base64,
      directory: directory,
      recursive: true
    });
    
    console.log('File written successfully:', writeResult);
    
    // Verify file was created
    try {
      const stat = await Filesystem.stat({
        path: filePath,
        directory: directory
      });
      console.log('File verified - size:', stat.size, 'bytes');
      
      if (stat.size === 0) {
        throw new Error('File was created but has zero size');
      }
    } catch (statError) {
      console.error('File verification failed:', statError);
      throw new Error(`File verification failed: ${statError.message}`);
    }
    
    const platformName = platform === 'ios' ? 'iOS Documents' : 'Android Documents';
    
    return {
      uriOrUrl: '',
      success: true,
      message: `PDF saved successfully to ${platformName}/WealthElite/`
    };
    
  } catch (error) {
    console.error('Save only error - Full details:', error);
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    
    let errorMessage = 'Failed to save PDF to device';
    
    if (error instanceof Error) {
      if (error.message.includes('permission') || error.message.includes('Permission')) {
        errorMessage = 'Permission denied. Please allow file access in app settings.';
      } else if (error.message.includes('space') || error.message.includes('storage') || error.message.includes('Storage')) {
        errorMessage = 'Insufficient storage space. Please free up some space and try again.';
      } else if (error.message.includes('directory') || error.message.includes('path') || error.message.includes('Directory')) {
        errorMessage = 'Could not access storage directory. Please try again.';
      } else if (error.message.includes('base64') || error.message.includes('encoding')) {
        errorMessage = 'Invalid PDF data format. Please try generating the PDF again.';
      } else {
        errorMessage = `Save failed: ${error.message}`;
      }
    }
    
    return {
      uriOrUrl: '',
      success: false,
      message: errorMessage
    };
  }
}

/**
 * Share PDF only without permanent storage - creates temporary file for sharing
 */
export async function shareOnlyPdf(base64: string, filename: string = 'wealth-dashboard-report.pdf'): Promise<SaveShareResult> {
  if (!Capacitor.isNativePlatform()) {
    // Fallback to regular web download for non-native platforms
    return await handleWebFallback(base64, filename);
  }

  try {
    console.log('Starting PDF share-only process...');
    const platform = Capacitor.getPlatform();
    console.log('Platform detected:', platform);
    
    const directory = Directory.Cache; // Use cache directory for temporary files
    const tempFilePath = `temp_${Date.now()}_${filename}`;
    
    console.log('Creating temporary file:', tempFilePath);
    console.log('Base64 data length:', base64.length);
    
    // Validate base64 data
    if (!base64 || base64.length === 0) {
      throw new Error('Invalid base64 data: empty or null');
    }
    
    // Write temporary file (base64 data is handled automatically)
    const writeResult = await Filesystem.writeFile({
      path: tempFilePath,
      data: base64,
      directory: directory,
      recursive: true
    });
    
    console.log('Temporary file created for sharing:', writeResult);
    
    // Get the URI of the temporary file
    const uriResult = await Filesystem.getUri({
      directory: directory,
      path: tempFilePath
    });
    
    console.log('Temporary file URI obtained:', uriResult.uri);
    
    // Validate URI format before sharing
    if (!uriResult.uri || (!uriResult.uri.startsWith('file://') && !uriResult.uri.startsWith('content://'))) {
      console.error('Invalid URI format:', uriResult.uri);
      throw new Error(`Invalid file URI format: ${uriResult.uri}`);
    }
    
    try {
      // Share the temporary file
      await Share.share({
        title: 'WealthElite Dashboard Report',
        text: 'Your wealth dashboard report is ready to view',
        url: uriResult.uri,
        dialogTitle: 'Share Dashboard Report'
      });
      
      // Clean up temporary file after sharing (with delay to ensure sharing completes)
      setTimeout(async () => {
        try {
          await Filesystem.deleteFile({
            path: tempFilePath,
            directory: directory
          });
          console.log('Temporary file cleaned up:', tempFilePath);
        } catch (cleanupError) {
          console.warn('Failed to cleanup temporary file:', cleanupError);
        }
      }, 5000); // 5 second delay
      
      return {
        uriOrUrl: uriResult.uri,
        success: true,
        message: 'PDF shared successfully (temporary file)'
      };
      
    } catch (shareError) {
      console.error('Share error details:', shareError);
      
      // Clean up temporary file if sharing fails
      try {
        await Filesystem.deleteFile({
          path: tempFilePath,
          directory: directory
        });
      } catch (cleanupError) {
        console.warn('Failed to cleanup temporary file after share error:', cleanupError);
      }
      
      if (shareError.message && shareError.message.includes('cancelled')) {
        return {
          uriOrUrl: '',
          success: false,
          message: 'Sharing was cancelled by user'
        };
      }
      
      throw shareError;
    }
    
  } catch (error) {
    console.error('Share only error - Full details:', error);
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    
    let errorMessage = 'Failed to share PDF';
    
    if (error instanceof Error) {
      if (error.message.includes('permission') || error.message.includes('Permission')) {
        errorMessage = 'Permission denied. Please allow file access in app settings.';
      } else if (error.message.includes('URI') || error.message.includes('uri')) {
        errorMessage = 'File sharing failed due to invalid file path. Please try again.';
      } else if (error.message.includes('base64') || error.message.includes('encoding')) {
        errorMessage = 'Invalid PDF data format. Please try generating the PDF again.';
      } else {
        errorMessage = `Share failed: ${error.message}`;
      }
    }
    
    return {
      uriOrUrl: '',
      success: false,
      message: errorMessage
    };
  }
}

/**
 * Handles native save and share functionality for iOS/Android
 */
async function handleNativeSaveShare(base64: string, filename: string): Promise<SaveShareResult> {
  try {
    console.log('Starting native save/share process...');
    const platform = Capacitor.getPlatform();
    console.log('Platform detected:', platform);
    
    // Use Documents directory for both iOS and Android for better compatibility
    const directory = Directory.Documents;
    
    // Create the file path with WealthElite folder
    const filePath = `WealthElite/${filename}`;
    
    console.log('Attempting to write file to:', filePath, 'in directory:', directory);
    console.log('Base64 data length:', base64.length);
    
    // Validate base64 data
    if (!base64 || base64.length === 0) {
      throw new Error('Invalid base64 data: empty or null');
    }
    
    // Write the file to the device (base64 data is handled automatically)
    const writeResult = await Filesystem.writeFile({
      path: filePath,
      data: base64,
      directory: directory,
      recursive: true // Create directories if they don't exist
    });
    
    console.log('File written successfully:', writeResult);
    
    // Verify file was created by checking its stats
    try {
      const stat = await Filesystem.stat({
        path: filePath,
        directory: directory
      });
      console.log('File verified - size:', stat.size, 'bytes');
      
      if (stat.size === 0) {
        throw new Error('File was created but has zero size');
      }
    } catch (statError) {
      console.error('File verification failed:', statError);
      throw new Error(`File verification failed: ${statError.message}`);
    }
    
    // Get the URI of the written file
    const uriResult = await Filesystem.getUri({
      directory: directory,
      path: filePath
    });
    
    console.log('File URI obtained:', uriResult.uri);
    
    // Validate URI format before sharing
    if (!uriResult.uri || (!uriResult.uri.startsWith('file://') && !uriResult.uri.startsWith('content://'))) {
      console.error('Invalid URI format:', uriResult.uri);
      throw new Error(`Invalid file URI format: ${uriResult.uri}`);
    }
    
    // Try to share the file, but handle cancellation gracefully
    let shareSuccess = true;
    let shareError = null;
    
    try {
      await Share.share({
        title: 'WealthElite Dashboard Report',
        text: 'Your wealth dashboard report is ready to view',
        url: uriResult.uri,
        dialogTitle: 'Share Dashboard Report'
      });
    } catch (error) {
      shareSuccess = false;
      shareError = error;
      console.error('Share error details:', error);
    }
    
    const platformName = platform === 'ios' ? 'iOS Documents' : 'Android Documents';
    const locationPath = 'Documents/WealthElite/';
    
    // Determine success message based on share result
    let message: string;
    if (shareSuccess) {
      message = `PDF saved to ${platformName}/WealthElite/ and shared successfully`;
    } else if (shareError && shareError.message && shareError.message.includes('cancelled')) {
      message = `PDF saved to ${locationPath} successfully. Sharing was cancelled by user.`;
    } else {
      message = `PDF saved to ${locationPath} successfully. Sharing failed - you can find the file in your documents folder.`;
    }
    
    return {
      uriOrUrl: uriResult.uri,
      success: true,
      message: message
    };
    
  } catch (error) {
    console.error('Native save/share error - Full details:', error);
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    
    // Provide more specific error messages
    let errorMessage = 'Failed to save PDF to device';
    
    if (error instanceof Error) {
      if (error.message.includes('permission') || error.message.includes('Permission')) {
        errorMessage = 'Permission denied. Please allow file access in app settings.';
      } else if (error.message.includes('space') || error.message.includes('storage') || error.message.includes('Storage')) {
        errorMessage = 'Insufficient storage space. Please free up some space and try again.';
      } else if (error.message.includes('directory') || error.message.includes('path') || error.message.includes('Directory')) {
        errorMessage = 'Could not access storage directory. Please try again.';
      } else if (error.message.includes('URI') || error.message.includes('uri')) {
        errorMessage = 'File saving failed due to invalid file path. Please try again.';
      } else if (error.message.includes('base64') || error.message.includes('encoding')) {
        errorMessage = 'Invalid PDF data format. Please try generating the PDF again.';
      } else {
        errorMessage = `Save failed: ${error.message}`;
      }
    }
    
    return {
      uriOrUrl: '',
      success: false,
      message: errorMessage
    };
  }
}

/**
 * Handles web fallback using browser download
 */
async function handleWebFallback(base64: string, filename: string): Promise<SaveShareResult> {
  try {
    // Convert base64 to blob
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'application/pdf' });
    
    // Create object URL
    const url = URL.createObjectURL(blob);
    
    // Create and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the object URL after a short delay
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
    
    return {
      uriOrUrl: url,
      success: true,
      message: 'PDF downloaded successfully to your Downloads folder'
    };
    
  } catch (error) {
    console.error('Web fallback error:', error);
    return {
      uriOrUrl: '',
      success: false,
      message: `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Checks if the device has sufficient permissions for file operations
 * This is a helper function for future permission checking if needed
 */
export async function checkFilePermissions(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    return true; // Web doesn't need special permissions for downloads
  }
  
  try {
    // Try to check if we can access the filesystem
    const platform = Capacitor.getPlatform();
    const directory = platform === 'ios' ? Directory.Documents : Directory.External;
    
    // Attempt to read the directory to check permissions
    await Filesystem.readdir({
      path: '',
      directory: directory
    });
    
    return true;
  } catch (error) {
    console.warn('File permission check failed:', error);
    return false;
  }
}

/**
 * Gets the appropriate save location message for the current platform
 */
export function getSaveLocationMessage(): string {
  if (!Capacitor.isNativePlatform()) {
    return 'Downloads folder';
  }
  
  const platform = Capacitor.getPlatform();
  return platform === 'ios' 
    ? 'Documents/WealthElite folder' 
    : 'External Storage/WealthElite folder';
}

/**
 * Utility to clean up old PDF files (optional maintenance function)
 */
export async function cleanupOldPdfs(daysOld: number = 30): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return; // Can't clean up browser downloads
  }
  
  try {
    const platform = Capacitor.getPlatform();
    const directory = platform === 'ios' ? Directory.Documents : Directory.External;
    const folderPath = 'WealthElite';
    
    const files = await Filesystem.readdir({
      path: folderPath,
      directory: directory
    });
    
    const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    
    for (const file of files.files) {
      if (file.name.startsWith('WealthElite-report-') && file.name.endsWith('.pdf')) {
        // Extract timestamp from filename
        const timestampMatch = file.name.match(/WealthElite-report-(\d+)\.pdf/);
        if (timestampMatch) {
          const fileTime = parseInt(timestampMatch[1]);
          if (fileTime < cutoffTime) {
            await Filesystem.deleteFile({
              path: `${folderPath}/${file.name}`,
              directory: directory
            });
            console.log(`Cleaned up old PDF: ${file.name}`);
          }
        }
      }
    }
  } catch (error) {
    console.warn('PDF cleanup failed:', error);
  }
}
