import { googleDriveService } from "../services/google-drive.service";
import express from "express";
import bodyParser from "body-parser";
import { downloadFileService } from "../services/download-file.service";
import { cliTable } from "../ui/cli-table";
import { fileRepository } from "../repository/file-repository";
import { loggingService } from "../services/logging.service";
import { fileChangeService } from "../services/file-change.service";
import ngrok from "@ngrok/ngrok";
const app = express();
app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
  if (req.headers["x-goog-resource-state"] && req.headers["x-goog-resource-state"] !== "sync") {
    loggingService.info(`Pending Update ${req.headers["x-goog-resource-state"]}`);
    const channelId = req.headers["x-goog-channel-id"] as string | undefined;
    const changeType = req.headers["x-goog-resource-state"] as string | undefined;
    fileChangeService.handleChange(changeType, channelId);
  }
  return res.send();
});

app.post("/download/:id", (req, res) => {
  try {
    const fileId = req.params.id;
    const file = fileRepository.getFile(fileId);
    if (file) {
      downloadFileService.downloadFile(file);
      return res.send("Download Requested");
    }
    return res.status(400).send("Invalid File");
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

    const session = await new ngrok.SessionBuilder().authtokenFromEnv().connect();
    const listener = await session.httpEndpoint().domain(`${process.env.NGROK_DOMAIN}`).listen();
    //@ts-ignore
    await ngrok.listen(app, listener);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

process.on("SIGINT", function () {
  ngrok.disconnect();
  process.exit(1);
});
