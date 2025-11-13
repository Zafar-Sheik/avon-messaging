export type StoredFile = {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: number;
  contentBase64: string;
};

export type Folder = {
  id: string;
  name: string;
  files: StoredFile[];
};

const STORAGE_KEY = "fileManagerData";

const readData = (): Folder[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Folder[]) : [];
};

const writeData = (folders: Folder[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
};

const genId = () => (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `id_${Date.now()}_${Math.random().toString(36).slice(2)}`);

export const getFolders = (): Folder[] => readData();

export const getFolderById = (id: string): Folder | undefined => readData().find((f) => f.id === id);

export const addFolder = (name: string): Folder => {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Folder name is required.");
  const folders = readData();
  const folder: Folder = { id: genId(), name: trimmed, files: [] };
  folders.push(folder);
  writeData(folders);
  return folder;
};

export const removeFolder = (id: string): boolean => {
  const folders = readData();
  const next = folders.filter((f) => f.id !== id);
  const removed = next.length !== folders.length;
  writeData(next);
  return removed;
};

export const addFilesToFolder = (folderId: string, files: StoredFile[]): Folder | null => {
  const folders = readData();
  const idx = folders.findIndex((f) => f.id === folderId);
  if (idx === -1) return null;
  folders[idx] = { ...folders[idx], files: [...folders[idx].files, ...files] };
  writeData(folders);
  return folders[idx];
};

export const removeFileFromFolder = (folderId: string, fileId: string): Folder | null => {
  const folders = readData();
  const idx = folders.findIndex((f) => f.id === folderId);
  if (idx === -1) return null;
  const files = folders[idx].files.filter((fl) => fl.id !== fileId);
  folders[idx] = { ...folders[idx], files };
  writeData(folders);
  return folders[idx];
};

export const clearAllFiles = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};