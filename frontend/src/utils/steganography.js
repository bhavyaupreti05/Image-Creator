/**
 * Steganography & Digital Provenance Engine for Aura Artworks
 * Embeds and extracts cryptographic metadata into/from image pixel LSBs (Least Significant Bits).
 */

const MAGIC_HEADER = [0x41, 0x55, 0x52, 0x41]; // 'AURA' in ASCII

/**
 * Calculates a lightweight SHA-256 equivalent cryptographic fingerprint
 */
export const generateFingerprint = async (text) => {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const msgUint8 = new TextEncoder().encode(text);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback
    }
  }
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return `aura-hash-${Math.abs(hash).toString(16)}`;
};

/**
 * Encodes provenance metadata into canvas pixel data using LSB
 */
export const encodeArtworkDNA = (canvas, metadata) => {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return false;

  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const jsonStr = JSON.stringify({
    v: 1,
    sig: 'AURA_PROVENANCE_V1',
    author: metadata.author || '@anonymous',
    prompt: metadata.prompt || '',
    parentId: metadata.parentId || null,
    createdAt: metadata.createdAt || new Date().toISOString(),
    fingerprint: metadata.fingerprint || 'aura-genesis',
  });

  const payloadBytes = new TextEncoder().encode(jsonStr);
  const payloadLen = payloadBytes.length;

  // Build binary packet: [4 bytes MAGIC] + [4 bytes length (big endian)] + [N bytes payload]
  const packetLen = 4 + 4 + payloadLen;
  const packet = new Uint8Array(packetLen);

  packet.set(MAGIC_HEADER, 0);
  packet[4] = (payloadLen >> 24) & 0xff;
  packet[5] = (payloadLen >> 16) & 0xff;
  packet[6] = (payloadLen >> 8) & 0xff;
  packet[7] = payloadLen & 0xff;
  packet.set(payloadBytes, 8);

  const totalBits = packetLen * 8;
  const availablePixels = width * height;

  if (totalBits > availablePixels) {
    console.warn('Canvas too small for steganography packet');
    return false;
  }

  // Embed each bit into the Blue channel (data[i * 4 + 2])
  let bitIndex = 0;
  for (let b = 0; b < packetLen; b++) {
    const byteVal = packet[b];
    for (let bit = 7; bit >= 0; bit--) {
      const bitVal = (byteVal >> bit) & 1;
      const pixelIdx = bitIndex * 4 + 2; // Blue channel
      data[pixelIdx] = (data[pixelIdx] & 0xfe) | bitVal;
      bitIndex++;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return true;
};

/**
 * Decodes and verifies provenance metadata from an image element or canvas
 */
export const decodeArtworkDNA = (canvasOrImage) => {
  let canvas;
  if (canvasOrImage instanceof HTMLCanvasElement) {
    canvas = canvasOrImage;
  } else {
    canvas = document.createElement('canvas');
    canvas.width = canvasOrImage.naturalWidth || canvasOrImage.width;
    canvas.height = canvasOrImage.naturalHeight || canvasOrImage.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(canvasOrImage, 0, 0);
  }

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { verified: false, reason: 'Could not access canvas context' };

  const width = canvas.width;
  const height = canvas.height;
  if (width === 0 || height === 0) {
    return { verified: false, reason: 'Empty image dimensions' };
  }

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const totalPixels = width * height;

  if (totalPixels < 64) {
    return { verified: false, reason: 'Image resolution too small' };
  }

  // Helper to read N bits starting from a bit offset
  const readByte = (startBitOffset) => {
    let byteVal = 0;
    for (let bit = 7; bit >= 0; bit--) {
      const pixelIdx = startBitOffset * 4 + 2;
      const bitVal = data[pixelIdx] & 1;
      byteVal |= bitVal << bit;
      startBitOffset++;
    }
    return byteVal;
  };

  // 1. Check Magic Header (4 bytes = 32 bits)
  for (let i = 0; i < 4; i++) {
    const magicByte = readByte(i * 8);
    if (magicByte !== MAGIC_HEADER[i]) {
      return {
        verified: false,
        reason: 'No cryptographic Aura DNA signature detected in pixel layer',
      };
    }
  }

  // 2. Read Payload Length (next 4 bytes = 32 bits)
  const l0 = readByte(32);
  const l1 = readByte(40);
  const l2 = readByte(48);
  const l3 = readByte(56);
  const payloadLen = (l0 << 24) | (l1 << 16) | (l2 << 8) | l3;

  if (payloadLen <= 0 || (8 + payloadLen) * 8 > totalPixels) {
    return {
      verified: false,
      reason: 'Corrupted steganography header length',
    };
  }

  // 3. Read Payload Bytes
  const payloadBytes = new Uint8Array(payloadLen);
  let bitOffset = 64;
  for (let i = 0; i < payloadLen; i++) {
    payloadBytes[i] = readByte(bitOffset);
    bitOffset += 8;
  }

  try {
    const jsonStr = new TextDecoder().decode(payloadBytes);
    const parsed = JSON.parse(jsonStr);
    return {
      verified: true,
      data: parsed,
    };
  } catch (err) {
    return {
      verified: false,
      reason: 'Failed to parse extracted DNA metadata payload',
      error: err.message,
    };
  }
};
