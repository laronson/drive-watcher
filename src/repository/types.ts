export type File = {
  id: string;
  permissions: Permission[];
  name?: string;
  mimeType: string;
  downloadState: DownloadState;
  channelId?: string;
};

export type Permission = {
  id: string;
  emailAddress: string;
  role: string;
  displayName: string;
};

export type DownloadState = "not downloaded" | "downloading" | "download complete";
