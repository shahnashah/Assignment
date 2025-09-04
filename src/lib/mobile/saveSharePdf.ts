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
 * @returns Promise with file URI/URL and status
 */
export async function saveOrSharePdf(
  base64: string, 
  filename?: string
): Promise<SaveShareResult> {
  const defaultFilename = filename || `WealthElite-report-${Date.now()}.pdf`;
  
  try {
    if (Capacitor.isNativePlatform()) {
      return await handleNativeSaveShare(base64, defaultFilename);
    } else {
      return await handleWebFallback(base64, defaultFilename);
    }
  } catch (error) {
    console.error('Error in saveOrSharePdf:', error);
    return {
      uriOrUrl: '',
      success: false,
      message: `Failed to save/share PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
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
    const directory = platform === 'ios' ? Directory.Documents : Directory.External;
    
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
    
    // Get the URI of the written file
    const uriResult = await Filesystem.getUri({
      directory: directory,
      path: filePath
    });
    
    console.log('File URI obtained:', uriResult.uri);
    
    // Share the file using the native share sheet
    await Share.share({
      title: 'WealthElite Dashboard Report',
      text: 'Your wealth dashboard report is ready to view',
      url: uriResult.uri,
      dialogTitle: 'Share Dashboard Report'
    });
    
    const platformName = platform === 'ios' ? 'iOS Documents' : 'Android External Storage';
    
    return {
      uriOrUrl: uriResult.uri,
      success: true,
      message: `PDF saved to ${platformName}/WealthElite/ and shared successfully`
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
      } else if (error.message.includes('share')) {
        errorMessage = 'PDF saved successfully but sharing failed. Check the WealthElite folder in your files.';
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
