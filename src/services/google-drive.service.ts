import { GoogleAuth } from "google-auth-library";
import { google, drive_v3 } from "googleapis";
import { resolve } from "app-root-path";
import { v4 } from "uuid";
import { File, Permission } from "./../repository/types";
import { Readable } from "stream";

const SCOPES = ["https://www.googleapis.com/auth/drive"];

class GoogleDriveService {
  private client: GoogleAuth | undefined;
  private drive: drive_v3.Drive;
  constructor() {
    this.drive = google.drive({ version: "v3" });
  }

  public async init() {
    if (!!this.client) {
      return;
    }
    this.client = this.getAuthenticatedGoogleClient();
    this.drive = google.drive({ version: "v3", auth: this.client });
  }

  public async listFiles(): Promise<File[]> {
    const fileResponse = await this.drive.files.list({
      pageSize: 10,
      fields: "nextPageToken, files(id, name, mimeType, permissions(id, emailAddress, displayName, role))",
      q: "mimeType = 'application/vnd.google-apps.document' or mimeType = 'application/vnd.google-apps.spreadsheet'",
    });

    return (
      fileResponse.data.files?.map((driveFile) => {
        const channelId = v4();
        const mappedFile = this.mapDriveFileToFile(driveFile, channelId);
        this.watchFile(mappedFile.id, channelId);
        return mappedFile;
      }) || []
    );
  }

  public async listFile(fileId: string) {
    const file = await this.drive.files.get({
      fileId,
      fields: "id, name, mimeType, permissions(id, emailAddress, displayName, role)",
    });
    console.log(file);
    return this.mapDriveFileToFile(file.data);
  }

  public async exportFile(fileId: string, mimeType: string): Promise<Readable> {
    const res = await this.drive.files.export({ fileId, mimeType }, { responseType: "stream" });
    return res.data;
  }

  private async watchFile(fileId: string, channelId: string) {
    return this.drive.files.watch({
      fileId: fileId,
      requestBody: {
        id: channelId,
        type: "web_hook",
        address: "https://verified-specially-crow.ngrok-free.app/webhook",
      },
    });
  }

  private getAuthenticatedGoogleClient() {
    return new google.auth.GoogleAuth({ keyFile: resolve(".google-auth-config.json"), scopes: SCOPES });
  }

  private mapDriveFileToFile({ id, name, mimeType, permissions = [] }: drive_v3.Schema$File, channelId?: string): File {
    return {
      id: id || "",
      name: name || "",
      permissions: permissions.map((drivePermission) => this.mapDrivePermissionToPermission(drivePermission)),
      mimeType: mimeType || "",
      downloadState: "not downloaded",
      channelId,
    };
  }

  private mapDrivePermissionToPermission(drivePermission: drive_v3.Schema$Permission): Permission {
    return {
      id: drivePermission.id || "",
      displayName: drivePermission.displayName || "",
      emailAddress: drivePermission.emailAddress || "",
      role: drivePermission.role || "",
    };
  }
}
export const googleDriveService = new GoogleDriveService();
