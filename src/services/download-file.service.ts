import { DownloadState, File } from "./../repository/types";
import * as fs from "fs";
import { resolve } from "app-root-path";
import { googleDriveService } from "./google-drive.service";
import { fileRepository } from "../repository/file-repository";
import { cliTable } from "../ui/cli-table";

const supportedDownloadMetadataConversions: { [id: string]: { mimeType: string; ext: string } } = {
  "application/vnd.google-apps.document": { mimeType: "text/plain", ext: ".txt" },
  "application/vnd.google-apps.spreadsheet": { mimeType: "text/csv", ext: ".csv" },
};

class DownloadFileService {
  constructor() {
    if (!fs.existsSync(resolve("downloads"))) {
      fs.mkdirSync(resolve("downloads"));
    }
  }

  public async downloadFile(file: File) {
    const fileMetadata = this.getDownloadMetadata(file.mimeType);
    if (!fileMetadata) {
      throw new Error(`Downloads are not supported for file type: ${file.mimeType}`);
    }
    this.setFileUiDownloadState(file.id, "downloading");

    const downloadFileName = file.name || `download-${new Date().toISOString()}`;
    const dest = fs.createWriteStream(resolve(`downloads/${downloadFileName}${fileMetadata.ext}`), {});
    const downloadStream = await googleDriveService.exportFile(file.id, fileMetadata.mimeType);

    downloadStream
      .on("end", () => {
        this.setFileUiDownloadState(file.id, "download complete");
      })
      .on("error", (err) => {
        console.error("Error downloading file.");
        throw err;
      })
      .pipe(dest);
  }

  private getDownloadMetadata(fileMimeType: string) {
    return supportedDownloadMetadataConversions[fileMimeType];
  }

  private setFileUiDownloadState(fileId: string, downloadState: DownloadState) {
    fileRepository.setDownloadingState(fileId, downloadState);
    cliTable.updateTable();
  }
}

export const downloadFileService = new DownloadFileService();
