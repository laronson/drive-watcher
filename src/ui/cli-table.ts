import Table from "cli-table3";
import { PrintableFile, PrintablePermission, TableColumn } from "./types";
import { fileRepository } from "../repository/file-repository";

const TABLE_COLUMNS: Record<keyof PrintableFile, TableColumn> = {
  id: { columnName: "File ID", columnWidth: 50, idx: 0 },
  name: { columnName: "File Name", columnWidth: 30, idx: 1 },
  permissions: { columnName: "Users & Permissions", columnWidth: 50, idx: 3 },
  downloadState: { columnName: "Download State", columnWidth: 50, idx: 4 },
};

// const TABLE_COLUMNS: TableColumn[] = [
//   { columnName: "File ID", columnWidth: 50 },
//   { columnName: "File Name", columnWidth: 30 },
//   { columnName: "Users & Permissions", columnWidth: 100 },
//   { columnName: "Downloaded", columnWidth: 50 },
// ];

class CliTable {
  private tableParams: { head: string[]; colWidths: number[]; wordWrap: true };

  constructor() {
    this.tableParams = {
      head: [
        TABLE_COLUMNS.id.columnName,
        TABLE_COLUMNS.name.columnName,
        TABLE_COLUMNS.permissions.columnName,
        TABLE_COLUMNS.downloadState.columnName,
      ],
      colWidths: [
        TABLE_COLUMNS.id.columnWidth,
        TABLE_COLUMNS.name.columnWidth,
        TABLE_COLUMNS.permissions.columnWidth,
        TABLE_COLUMNS.downloadState.columnWidth,
      ],
      wordWrap: true,
    };
  }

  public updateTable() {
    const tableData = fileRepository.getFiles();
    this.printTable(tableData);
  }

  private printPermissionList(permissions: PrintablePermission[]) {
    return permissions
      .filter((permission) => permission.displayName)
      .map((permission) => {
        const displayName =
          permission.displayName.length > 30 ? `${permission.displayName.slice(0, 25)}...` : permission.displayName;
        return `${displayName}(${permission.role})`;
      })
      .join(", ");
  }

  private printTable(files: PrintableFile[]) {
    console.clear();
    const table = new Table(this.tableParams);
    files.forEach((file) =>
      table.push([file.id, file.name, this.printPermissionList(file.permissions), file.downloadState]),
    );
    console.log(table.toString());
  }
}

export const cliTable = new CliTable();
