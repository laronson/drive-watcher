import { googleDriveService } from "../services/google-drive.service";
import express from "express";
import bodyParser from "body-parser";
import { downloadFileService } from "../services/download-file.service";
import { cliTable } from "../ui/cli-table";
import { fileRepository } from "../repository/file-repository";
import { loggingService } from "../services/logging.service";
const app = express();
app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
  if (req.headers["x-goog-resource-state"] && req.headers["x-goog-resource-state"] === "update") {
    const channelId = req.headers["x-goog-channel-id"] as string | undefined;
    const file = fileRepository.getFileByChannelId(channelId);
    if (file && file.id) {
      const updatedFile = await googleDriveService.listFile(file.id);
      fileRepository.upsertFile(updatedFile);
      cliTable.updateTable();
    }
  }
  res.status(200).send("recieved");
});

app.post("/download/:id", (req, res) => {
  try {
    const fileId = req.params.id;
    const file = fileRepository.getFile(fileId);
    if (file) {
      downloadFileService.downloadFile(file);
      res.status(200).send("Download Requested");
    }
    res.status(400).send("Invalid File");
  } catch (err) {
    loggingService.error(err as Error);
  }
});

export async function runApp() {
  try {
    app.listen(process.env.PORT, async () => {
      loggingService.info(`Application Running on PORT ${process.env.PORT}`);
      await googleDriveService.init();
      const files = await googleDriveService.listFiles();
      fileRepository.addFiles(files);
      cliTable.updateTable();
    });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}
