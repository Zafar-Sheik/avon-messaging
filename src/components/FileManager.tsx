"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { showError, showSuccess } from "@/utils/toast";
import {
  Folder,
  StoredFile,
  getFolders,
  addFolder,
  addFilesToFolder,
  removeFolder,
  removeFileFromFolder,
} from "@/utils/fileStore";
import {
  FolderPlus,
  Trash2,
  Upload,
  Download,
  FolderOpen,
  File,
} from "lucide-react";

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve((reader.result as string).split(",")[1] || "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const base64ToBlob = (base64: string, type: string): Blob => {
  const byteChars = atob(base64);
  const byteNums = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++)
    byteNums[i] = byteChars.charCodeAt(i);
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
        id: globalThis.crypto?.randomUUID
          ? globalThis.crypto.randomUUID()
          : `file_${Date.now()}_${Math.random().toString(36).slice(2)}`,
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
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-blue-600" />
          <div>
            <CardTitle className="text-xl">File Manager</CardTitle>
            <CardDescription>
              Create folders and upload files locally (stored in your browser).
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Folders Sidebar */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="New folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && createFolder()}
              />
              <Button onClick={createFolder} className="whitespace-nowrap">
                <FolderPlus className="mr-2 h-4 w-4" />
                Create
              </Button>
            </div>

            <Card className="border">
              <ScrollArea className="h-64">
                <div className="p-2 space-y-1">
                  {folders.length === 0 ? (
                    <div className="text-sm text-muted-foreground p-4 text-center">
                      <File className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      No folders yet.
                    </div>
                  ) : (
                    folders.map((f) => (
                      <div
                        key={f.id}
                        className={`flex items-center justify-between p-3 rounded cursor-pointer transition-colors ${
                          selectedFolderId === f.id
                            ? "bg-blue-50 border border-blue-200"
                            : "hover:bg-gray-50 border border-transparent"
                        }`}
                        onClick={() => setSelectedFolderId(f.id)}
                      >
                        <div className="flex items-center gap-3">
                          <FolderOpen
                            className={`h-4 w-4 ${
                              selectedFolderId === f.id
                                ? "text-blue-600"
                                : "text-gray-500"
                            }`}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">
                              {f.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {f.files.length} file(s)
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFolder(f.id);
                          }}
                          className="h-8 w-8 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>

          {/* Files Content */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <Input
                type="file"
                multiple
                onChange={(e) => onUploadFiles(e.target.files)}
                disabled={!selectedFolderId}
                className="flex-1"
              />
              <Button
                variant="secondary"
                disabled={!selectedFolderId}
                className="whitespace-nowrap"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </div>

            {!selectedFolder && (
              <Card className="p-8 text-center border">
                <FolderOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <h3 className="font-medium text-gray-900 mb-1">
                  Select a Folder
                </h3>
                <p className="text-sm text-muted-foreground">
                  Choose a folder from the sidebar to view and manage files.
                </p>
              </Card>
            )}

            {selectedFolder && (
              <Card className="border">
                <div className="p-4 border-b">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{selectedFolder.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({selectedFolder.files.length} files)
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  {selectedFolder.files.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <File className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>No files in this folder yet.</p>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Uploaded</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedFolder.files.map((file) => (
                            <TableRow key={file.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <File className="h-4 w-4 text-gray-400" />
                                  {file.name}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {file.type || "Unknown"}
                              </TableCell>
                              <TableCell className="text-sm">
                                {(file.size / 1024).toFixed(1)} KB
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(file.uploadedAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => downloadFile(file)}
                                    className="h-8"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => deleteFile(file.id)}
                                    className="h-8"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </Card>
            )}

            <p className="text-xs text-muted-foreground">
              Note: Files are stored in your browser's local storage. Large
              files may not be supported due to storage limits.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileManager;
