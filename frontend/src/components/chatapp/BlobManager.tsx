import { useState } from "react";

export class BlobManager {

  static blobToString(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const base64data = reader.result as string;
        // console.log(base64data);
        resolve(base64data);
      };
      
      reader.onerror = () => {
        reject(new Error("Failed to convert blob to string"));
      };
      
      reader.readAsDataURL(blob);
    });
  }

  static stringToBlob(string: string): Blob {
    const base64Data = string.split(',')[1];
    const binaryString = window.atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Create a new Blob from the binary data with the same MIME type
    const reconvertedBlob = new Blob([bytes.buffer], { type: 'audio/ogg; codecs=opus' });
    return reconvertedBlob;
   }

}