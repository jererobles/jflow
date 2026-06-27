import "./styles.css";
import { mountApp } from "./ui/app";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App container not found.");
}

mountApp(app);
