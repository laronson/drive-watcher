import { fileRepository } from "../repository/file-repository";
import { cliTable } from "../ui/cli-table";
import { googleDriveService } from "./google-drive.service";

const ACCEPTED_CHANGE_TYPES = ["add", "remove", "update", "trash"];

class FileChangeService {
  public async handleChange(changeType: string, channelId: string | undefined) {
    if (ACCEPTED_CHANGE_TYPES.some((ct) => ct === changeType)) {
      if (changeType === "update" || changeType === "add") {
        await this.filePermissionsUpdate(channelId);
      } else if (changeType === "trash") {
        this.resourceRemoved(channelId);
      }
      cliTable.updateTable();
    }
  }

  public async filePermissionsUpdate(channelId: string | undefined) {
    const file = fileRepository.getFileByChannelId(channelId);
    if (file && file.id) {
      const updatedFile = await googleDriveService.listFile(file.id);
      fileRepository.upsertFile(updatedFile, channelId);
    }
  }

  public resourceRemoved(channelId: string | undefined) {
    fileRepository.removeFileByChannelId(channelId);
  }
}
export const fileChangeService = new FileChangeService();
