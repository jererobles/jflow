/** App entry – assembles the visual editor */

import { initCanvas } from "./canvas";
import { initPalette, handleCanvasDrop } from "./palette";
import { initPanel } from "./panel";
import { initToolbar } from "./toolbar";
import { deserialize } from "./serializer";
import mathAndForkSample from "../samples/mathAndFork.yml?raw";

export function mountApp(root: HTMLElement) {
  root.innerHTML = "";
  root.className = "jf-app";

  // Layout structure
  root.innerHTML = `
    <div class="jf-layout">
      <div class="jf-layout__canvas" id="jf-canvas-container"></div>
      <div class="jf-layout__sidebar" id="jf-sidebar"></div>
    </div>
  `;

  const canvasContainer = root.querySelector<HTMLDivElement>("#jf-canvas-container")!;
  const sidebar = root.querySelector<HTMLDivElement>("#jf-sidebar")!;

  // Init toolbar
  initToolbar(root);

  // Init canvas
  initCanvas(canvasContainer);

  // Drop zone
  canvasContainer.addEventListener("dragover", (e) => e.preventDefault());
  canvasContainer.addEventListener("drop", handleCanvasDrop);

  // Init sidebar components
  initPalette(sidebar);
  initPanel(sidebar);

  // Load default sample
  deserialize(mathAndForkSample);
}
