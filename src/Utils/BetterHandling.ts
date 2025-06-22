export function getFileType(file: File): "image" | "video" | "unknown" {
  if (file.type.startsWith("image/")) {
    return "image";
  } else if (file.type.startsWith("video/")) {
    return "video";
  } else {
    return "unknown";
  }
}

export function getDynamicImageQuality(): number {
  const connection = (navigator as any).connection || {};
  const effectiveType = connection.effectiveType || "4g";
  switch (effectiveType) {
    case "slow-2g":
    case "2g": return 0.4;
    case "3g": return 0.6;
    default: return 0.8;
  }
}

export async function compressImage(file: File, maxSize = 1024): Promise<File> {
  const quality = getDynamicImageQuality();
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => (img.src = e.target?.result as string);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject("Compression failed");
          resolve(new File([blob], file.name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality
      );
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function prepareFile(file: File) {
  const fileType = getFileType(file);
  const compressedFile = fileType === "image" ? await compressImage(file) : file;
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = () => {
      resolve({
        data: Array.from(new Uint8Array(reader.result as ArrayBuffer)),
        name: compressedFile.name,
        type: compressedFile.type,
        size: compressedFile.size,
      });
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(compressedFile);
  });
}
