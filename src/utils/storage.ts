// Utility functions for safe localStorage operations and image compression

// Compress and resize images to reduce storage size
export const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxWidth) {
          width = (width * maxWidth) / height;
          height = maxWidth;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Compress base64 image
export const compressBase64Image = (base64: string, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxWidth) {
          width = (width * maxWidth) / height;
          height = maxWidth;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    
    img.src = base64;
  });
};

// Safe localStorage operations with size checking
export const safeSetItem = (key: string, value: string): boolean => {
  try {
    const sizeInMB = new Blob([value]).size / (1024 * 1024);
    if (sizeInMB > 4) { // Limit to 4MB per item
      console.warn(`Data too large for localStorage: ${sizeInMB.toFixed(2)}MB`);
      return false;
    }
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error('localStorage error:', error);
    return false;
  }
};

export const safeGetItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('localStorage get error:', error);
    return null;
  }
};

// Clear old data if storage is full
export const clearOldData = (): void => {
  try {
    // Remove old items if storage is getting full
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('old_') || key.includes('backup_')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing old data:', error);
  }
};

// Get storage usage information
export const getStorageInfo = (): { used: number; available: number; percentage: number } => {
  try {
    let used = 0;
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      used += localStorage.getItem(key)?.length || 0;
    });
    
    const usedMB = used / (1024 * 1024);
    const availableMB = 5 - usedMB; // Assuming 5MB limit
    const percentage = (usedMB / 5) * 100;
    
    return {
      used: usedMB,
      available: availableMB,
      percentage
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return { used: 0, available: 5, percentage: 0 };
  }
}; 