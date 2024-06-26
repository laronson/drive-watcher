import { runApp } from "./server/server";
import dotenv from "dotenv";

if (process.env.NODE_ENV === "development") {
  dotenv.config({ path: "./.env.development" });
  console.log("Application Starting");
} else {
  dotenv.config({ path: "./.env" });
}

(async () => {
  await runApp();
})();
