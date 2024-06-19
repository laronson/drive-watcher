import { runApp } from "./app/app";
import dotenv from "dotenv";

if (process.env.NODE_ENV === "development") {
  dotenv.config({ path: "./.env.development" });
  console.log("Application Starting");
}

(async () => await runApp())();
