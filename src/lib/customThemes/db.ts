/** IndexedDB 기반 커스텀 테마 저장소. */

export interface CustomThemeDef {
  id: string;          // 'custom-' + timestamp
  name: string;
  emoji: string;
  createdAt: number;
  backgroundImageIds: string[];  // 최대 5개
  sampleImageIds: string[];      // 최대 10개 (갤러리 샘플 캐릭터)
  worksheetImageIds: string[];   // 최대 10개 (인쇄용 학습지)
}

const DB_NAME = 'classgallery-custom-v1';
const DB_VER = 1;
let _db: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('images')) db.createObjectStore('images');
      if (!db.objectStoreNames.contains('registry')) db.createObjectStore('registry');
    };
    req.onsuccess = () => { _db = req.result; resolve(req.result); };
    req.onerror = () => reject(req.error);
  });
}

export async function dbSaveImage(id: string, blob: Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('images', 'readwrite');
    tx.objectStore('images').put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function dbLoadImage(id: string): Promise<Blob | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction('images', 'readonly').objectStore('images').get(id);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function dbDeleteImages(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('images', 'readwrite');
    ids.forEach((id) => tx.objectStore('images').delete(id));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function dbSaveRegistry(themes: CustomThemeDef[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('registry', 'readwrite');
    tx.objectStore('registry').put(themes, 'all');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function dbLoadRegistry(): Promise<CustomThemeDef[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction('registry', 'readonly').objectStore('registry').get('all');
    req.onsuccess = () => resolve(Array.isArray(req.result) ? req.result : []);
    req.onerror = () => reject(req.error);
  });
}

/** 파일을 업로드 시 maxDim 이하로 리사이즈 후 JPEG blob 반환. */
export function compressImage(file: File, maxDim: number, quality = 0.88): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const src = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(src);
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height, 1));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('canvas context 오류')); return; }
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('blob 변환 실패'));
      }, 'image/jpeg', quality);
    };
    img.onerror = () => { URL.revokeObjectURL(src); reject(new Error('이미지 로드 실패')); };
    img.src = src;
  });
}
