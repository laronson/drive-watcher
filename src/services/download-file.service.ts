import { DownloadState, File } from "./../repository/types";
import * as fs from "fs";
import { resolve } from "app-root-path";
import { googleDriveService } from "./google-drive.service";
import { fileRepository } from "../repository/file-repository";
import { cliTable } from "../ui/cli-table";

const supportedDownloadMimeTypesConversions: { [id: string]: string } = {
  "application/vnd.google-apps.document": "text/plain",
  "application/vnd.google-apps.spreadsheet": "text/csv",
};

class DownloadFileService {
  constructor() {
    if (!fs.existsSync(resolve("downloads"))) {
      fs.mkdirSync(resolve("downloads"));
    }
  }

  public async downloadFile(file: File) {
    const mimeType = this.getMimeTypeConversion(file.mimeType);
    if (!mimeType) {
      throw new Error(`Downloads are not supported for file type: ${file.mimeType}`);
    }
    this.setFileUiDownloadState(file.id, "downloading");

    const downloadFileName = file.name || `download-${new Date().toISOString()}`;
    const dest = fs.createWriteStream(resolve(`downloads/${downloadFileName}`));
    const downloadStream = await googleDriveService.exportFile(file.id, mimeType);

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

  private getMimeTypeConversion(fileMimeType: string) {
    return supportedDownloadMimeTypesConversions[fileMimeType];
  }

  private setFileUiDownloadState(fileId: string, downloadState: DownloadState) {
    fileRepository.setDownloadingState(fileId, downloadState);
    cliTable.updateTable();
  }
}

export const downloadFileService = new DownloadFileService();
