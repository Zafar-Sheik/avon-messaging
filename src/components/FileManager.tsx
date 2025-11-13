"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { showError, showSuccess } from "@/utils/toast";
import { Folder, StoredFile, getFolders, addFolder, addFilesToFolder, removeFolder, removeFileFromFolder } from "@/utils/fileStore";
import { FolderPlus, Trash2, Upload, Download } from "lucide-react";

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1] || "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const base64ToBlob = (base64: string, type: string): Blob => {
  const byteChars = atob(base64);
  const byteNums = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
  const byteArray = new Uint8Array(byteNums);
  return new Blob([byteArray], { type });
};

const FileManager: React.FC = () => {
  const [folders, setFolders] = React.useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = React.useState<string>("");
  const [newFolderName, setNewFolderName] = React.useState("");

  React.useEffect(() => {
    const f = getFolders();
    setFolders(f);
    if (f.length > 0 && !selectedFolderId) setSelectedFolderId(f[0].id);
  }, []);

  const refreshFolders = () => {
    const f = getFolders();
    setFolders(f);
    if (!f.find((x) => x.id === selectedFolderId)) {
      setSelectedFolderId(f[0]?.id ?? "");
    }
  };

  const createFolder = () => {
    const name = newFolderName.trim();
    if (!name) {
      showError("Folder name is required.");
      return;
    }
    addFolder(name);
    setNewFolderName("");
    refreshFolders();
    showSuccess(`Folder "${name}" created.`);
  };

  const deleteFolder = (id: string) => {
    const removed = removeFolder(id);
    if (removed) {
      showSuccess("Folder deleted.");
      refreshFolders();
    } else {
      showError("Failed to delete folder.");
    }
  };

  const onUploadFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    if (!selectedFolderId) {
      showError("Please select a folder first.");
      return;
    }
    const filesArray = Array.from(fileList);
    const storedFiles: StoredFile[] = [];
    for (const f of filesArray) {
      const content = await toBase64(f);
      storedFiles.push({
        id: globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `file_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name: f.name,
        type: f.type || "application/octet-stream",
        size: f.size,
        uploadedAt: Date.now(),
        contentBase64: content,
      });
    }
    const updated = addFilesToFolder(selectedFolderId, storedFiles);
    if (updated) {
      refreshFolders();
      showSuccess(`Uploaded ${storedFiles.length} file(s).`);
    } else {
      showError("Failed to upload files.");
    }
  };

  const deleteFile = (fileId: string) => {
    if (!selectedFolderId) return;
    const updated = removeFileFromFolder(selectedFolderId, fileId);
    if (updated) {
      refreshFolders();
      showSuccess("File deleted.");
    } else {
      showError("Failed to delete file.");
    }
  };

  const downloadFile = (file: StoredFile) => {
    const blob = base64ToBlob(file.contentBase64, file.type);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const selectedFolder = folders.find((f) => f.id === selectedFolderId);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>File Manager</CardTitle>
        <CardDescription>Create folders and upload files locally (stored in your browser).</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="New folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
              <Button onClick={createFolder} className="whitespace-nowrap">
                <FolderPlus className="mr-2 h-4 w-4" />
                Create
              </Button>
            </div>
            <ScrollArea className="h-64 rounded border">
              <div className="p-2 space-y-1">
                {folders.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-2">No folders yet.</div>
                ) : (
                  folders.map((f) => (
                    <div
                      key={f.id}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer ${selectedFolderId === f.id ? "bg-muted" : "hover:bg-muted/50"}`}
                      onClick={() => setSelectedFolderId(f.id)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{f.name}</span>
                        <span className="text-xs text-muted-foreground">{f.files.length} file(s)</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); deleteFolder(f.id); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <Input
                type="file"
                multiple
                onChange={(e) => onUploadFiles(e.target.files)}
                disabled={!selectedFolderId}
              />
              <Button variant="secondary" disabled={!selectedFolderId}>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </div>

            {!selectedFolder && (
              <p className="text-sm text-muted-foreground">Select a folder to view files.</p>
            )}

            {selectedFolder && (
              <div className="rounded-md border">
                <div className="p-3 border-b">
                  <div className="text-sm">
                    Folder: <span className="font-medium">{selectedFolder.name}</span>
                  </div>
                </div>
                <div className="p-3">
                  {selectedFolder.files.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No files in this folder yet.</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Uploaded</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedFolder.files.map((file) => (
                          <TableRow key={file.id}>
                            <TableCell className="font-medium">{file.name}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{file.type || "Unknown"}</TableCell>
                            <TableCell className="text-xs">{(file.size / 1024).toFixed(1)} KB</TableCell>
                            <TableCell className="text-xs">{new Date(file.uploadedAt).toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => downloadFile(file)}>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => deleteFile(file.id)}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Note: Files are stored in your browser’s local storage. Large files may not be supported due to storage limits.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileManager;