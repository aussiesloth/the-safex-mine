import readyScene from "./assets/scenes/READY-STOPPED.png";
import miningScene from "./assets/scenes/MINING.png";
import approvedScene from "./assets/scenes/APPROVED.png";
import rejectScene from "./assets/scenes/REJECT.png";

import "./styles.css";

type SceneState = "ready" | "mining" | "approved" | "reject";

const scenes: Record<
  SceneState,
  {
    image: string;
    label: string;
    description: string;
  }
> = {
  ready: {
    image: readyScene,
    label: "READY / STOPPED",
    description: "Miner seated in chair",
  },

  mining: {
    image: miningScene,
    label: "MINING",
    description: "Miner working the rockface",
  },

  approved: {
    image: approvedScene,
    label: "BLOCK FOUND",
    description: "Accepted block",
  },

  reject: {
    image: rejectScene,
    label: "REJECTED",
    description: "Fool's gold",
  },
};

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="app-shell">

    <header class="topbar">

      <div class="brand">
        <div class="brand-title">The Safex Mine</div>
        <div class="brand-subtitle">Safex Cash Solo Miner</div>
      </div>

      <div class="connection-status">
        <span
          class="status-dot stopped"
          id="status-dot"
        ></span>

        <span id="connection-text">
          Ready
        </span>
      </div>

    </header>


    <main class="workspace">

      <section class="mine-panel">

        <div
          class="scene-placeholder"
          id="scene"
        >

          <img
            id="scene-image-a"
            class="scene-image scene-image-active"
            src="${readyScene}"
            alt=""
          />

          <img
            id="scene-image-b"
            class="scene-image"
            src="${readyScene}"
            alt=""
          />

          <div class="scene-text">
            <div
              class="scene-state"
              id="scene-state"
            >
              READY / STOPPED
            </div>

            <div
              class="scene-description"
              id="scene-description"
            >
              Miner seated in chair
            </div>
          </div>

        </div>

      </section>


      <aside class="control-panel">

        <section class="panel-section">

          <h2>Mining Status</h2>

          <div class="stat-grid">

            <div class="stat">
              <span class="stat-label">
                Hashrate
              </span>

              <strong>
                0 H/s
              </strong>
            </div>

            <div class="stat">
              <span class="stat-label">
                Blocks Found
              </span>

              <strong>
                0
              </strong>
            </div>

            <div class="stat">
              <span class="stat-label">
                Rejected
              </span>

              <strong>
                0
              </strong>
            </div>

            <div class="stat">
              <span class="stat-label">
                Session
              </span>

              <strong>
                00:00:00
              </strong>
            </div>

          </div>

        </section>


        <section class="panel-section">

          <h2>Mining Mode</h2>

          <div class="mode-buttons">

            <button
              class="mode-button"
              data-mode="Calm"
            >
              Calm
            </button>

            <button
              class="mode-button active"
              data-mode="Balanced"
            >
              Balanced
            </button>

            <button
              class="mode-button"
              data-mode="Full Bore"
            >
              Full Bore
            </button>

          </div>

        </section>


        <section class="panel-section">

          <h2>Connection</h2>

          <div class="field">
            <label for="address">
              Safex Cash Address
            </label>

            <input
              id="address"
              type="text"
              placeholder="Enter mining address"
            />
          </div>

          <div class="field">
            <label for="node">
              Node / RPC
            </label>

            <input
              id="node"
              type="text"
              placeholder="Default public node"
            />
          </div>

        </section>


        <section class="mining-controls">

          <button
            id="start-button"
            class="primary-button"
          >
            Start Mining
          </button>

          <button
            id="stop-button"
            class="secondary-button"
            disabled
          >
            Stop Mining
          </button>

        </section>


        <div class="backend-note">
          Mining backend not yet connected.
        </div>

      </aside>

    </main>

  </div>
`;

const startButton =
  document.querySelector<HTMLButtonElement>("#start-button")!;

const stopButton =
  document.querySelector<HTMLButtonElement>("#stop-button")!;

const statusDot =
  document.querySelector<HTMLSpanElement>("#status-dot")!;

const connectionText =
  document.querySelector<HTMLSpanElement>("#connection-text")!;

const sceneState =
  document.querySelector<HTMLDivElement>("#scene-state")!;

const sceneDescription =
  document.querySelector<HTMLDivElement>("#scene-description")!;

const imageA =
  document.querySelector<HTMLImageElement>("#scene-image-a")!;

const imageB =
  document.querySelector<HTMLImageElement>("#scene-image-b")!;

let activeImage = imageA;
let inactiveImage = imageB;

let currentState: SceneState = "ready";


function setScene(state: SceneState) {

  if (state === currentState) {
    return;
  }

  const scene = scenes[state];

  inactiveImage.src = scene.image;

  inactiveImage.classList.add(
    "scene-image-active",
  );

  activeImage.classList.remove(
    "scene-image-active",
  );

  const previousActive = activeImage;

  activeImage = inactiveImage;

  inactiveImage = previousActive;

  sceneState.textContent =
    scene.label;

  sceneDescription.textContent =
    scene.description;

  currentState = state;
}


document
  .querySelectorAll<HTMLButtonElement>(
    ".mode-button",
  )
  .forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(
            ".mode-button",
          )
          .forEach((item) =>
            item.classList.remove(
              "active",
            ),
          );

        button.classList.add(
          "active",
        );
      },
    );
  });


startButton.addEventListener(
  "click",
  () => {

    setScene("mining");

    statusDot.classList.remove(
      "stopped",
    );

    statusDot.classList.add(
      "mining",
    );

    connectionText.textContent =
      "Mining";

    startButton.disabled = true;
    stopButton.disabled = false;
  },
);


stopButton.addEventListener(
  "click",
  () => {

    setScene("ready");

    statusDot.classList.remove(
      "mining",
    );

    statusDot.classList.add(
      "stopped",
    );

    connectionText.textContent =
      "Ready";

    startButton.disabled = false;
    stopButton.disabled = true;
  },
);