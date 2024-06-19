import { runApp } from "./app/app";
import dotenv from "dotenv";

if (process.env.NODE_ENV === "development") {
  dotenv.config({ path: "./.env.development" });
  console.log("Application Starting");
}

(async () => await runApp())();

process.stdout.on("error", function (err) {
  if (err.code == "EPIPE") {
    process.exit(0);
  }
});
