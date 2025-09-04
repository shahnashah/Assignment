import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
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
    const platform = Capacitor.getPlatform();
    const directory = platform === 'ios' ? Directory.Documents : Directory.Data;
    const filePath = `WealthElite/${filename}`;
    
    // Write the file to the device
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
    } catch (statError) {
      console.warn('Could not verify file stats:', statError);
    }
    
    const platformName = platform === 'ios' ? 'iOS Documents' : 'Android App Data';
    
    return {
      uriOrUrl: '',
      success: true,
      message: `PDF saved successfully to ${platformName}/WealthElite/`
    };
    
  } catch (error) {
    console.error('Save only error:', error);
    return {
      uriOrUrl: '',
      success: false,
      message: `Save failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Handles native save and share functionality for iOS/Android
 */
async function handleNativeSaveShare(base64: string, filename: string): Promise<SaveShareResult> {
  try {
    // Determine the appropriate directory based on platform
    const platform = Capacitor.getPlatform();
    // Use Data directory for Android (more reliable on emulators) and Documents for iOS
    const directory = platform === 'ios' ? Directory.Documents : Directory.Data;
    
    // Create the file path with WealthElite folder
    const filePath = `WealthElite/${filename}`;
    
    // Write the file to the device
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
    } catch (statError) {
      console.warn('Could not verify file stats:', statError);
    }
    
    // Get the URI of the written file
    const uriResult = await Filesystem.getUri({
      directory: directory,
      path: filePath
    });
    
    console.log('File URI obtained:', uriResult.uri);
    
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
      console.log('Share error:', error);
    }
    
    const platformName = platform === 'ios' ? 'iOS Documents' : 'Android App Data';
    const locationPath = platform === 'ios' 
      ? 'Documents/WealthElite/' 
      : 'App Data/WealthElite/';
    
    // Determine success message based on share result
    let message: string;
    if (shareSuccess) {
      message = `PDF saved to ${platformName}/WealthElite/ and shared successfully`;
    } else if (shareError && shareError.message && shareError.message.includes('cancelled')) {
      message = `PDF saved to ${locationPath} successfully. Sharing was cancelled by user.`;
    } else {
      message = `PDF saved to ${locationPath} successfully. Sharing failed - you can find the file in your app's data folder.`;
    }
    
    return {
      uriOrUrl: uriResult.uri,
      success: true,
      message: message
    };
    
  } catch (error) {
    console.error('Native save/share error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to save PDF to device';
    
    if (error instanceof Error) {
      if (error.message.includes('permission')) {
        errorMessage = 'Permission denied. Please allow file access in app settings.';
      } else if (error.message.includes('space') || error.message.includes('storage')) {
        errorMessage = 'Insufficient storage space. Please free up some space and try again.';
      } else if (error.message.includes('directory') || error.message.includes('path')) {
        errorMessage = 'Could not access storage directory. Please try again.';
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
