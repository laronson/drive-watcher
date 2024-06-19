import { DownloadState } from "../repository/types";

export type PrintableFile = {
  id: string;
  name?: string;
  permissions: PrintablePermission[];
  downloadState: DownloadState;
};

export type PrintablePermission = {
  emailAddress: string;
  displayName: string;
  role: string;
};

export type TableColumn = {
  columnName: string;
  columnWidth: number;
  idx: number;
};
