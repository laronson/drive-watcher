import { DownloadState, File } from "./types";

class FileRepository {
  private files: File[];
  constructor() {
    this.files = [];
  }

  public addFiles(newFiles: File[]) {
    this.files.push(...newFiles);
  }

  public getFile(fileId: string) {
    return this.files.find((file) => file.id === fileId);
  }

  public getFiles() {
    return this.files;
  }

  public getFileByChannelId(channelId: string | undefined) {
    return this.files.find((file) => file.channelId === channelId);
  }

  public upsertFile(updateFile: File) {
    const existingIdx = this.files.findIndex((file) => file.id === updateFile.id);
    if (existingIdx > 0) {
      const existingDownloadState = this.files[existingIdx].downloadState;
      this.files[existingIdx] = { ...updateFile, downloadState: existingDownloadState };
    }
  }

  public setDownloadingState(fileId: string, downloadState: DownloadState) {
    const file = this.getFile(fileId);
    if (file) {
      file.downloadState = downloadState;
    }
  }
}

export const fileRepository = new FileRepository();
