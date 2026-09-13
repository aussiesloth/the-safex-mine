import { invoke } from "@tauri-apps/api/core";

import readyScene from "./assets/scenes/READY-STOPPED.png";
import miningScene from "./assets/scenes/MINING.png";
import approvedScene from "./assets/scenes/APPROVED.png";
import rejectScene from "./assets/scenes/REJECT.png";

import "./styles.css";

type SceneState = "ready" | "mining" | "approved" | "reject";
type TransientState = "approved" | "reject";

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

              <strong id="hashrate-value">
                0 H/s
              </strong>
            </div>

            <div class="stat">
              <span class="stat-label">
                Blocks Found
              </span>

              <strong id="blocks-found-value">
                0
              </strong>
            </div>

            <div class="stat">
              <span class="stat-label">
                Rejected
              </span>

              <strong id="rejected-value">
                0
              </strong>
            </div>

            <div class="stat">
              <span class="stat-label">
                Session
              </span>

              <strong id="session-time-value">
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
              Safex Address
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


        <section class="development-tests">

          <div class="development-label">
            DEVELOPMENT TESTS
          </div>

          <div class="development-buttons">

            <button
              id="test-approved-button"
              class="test-button"
              disabled
            >
              Test Block Found
            </button>

            <button
              id="test-reject-button"
              class="test-button"
              disabled
            >
              Test Reject
            </button>

          </div>

        </section>


        <div
  class="backend-note"
  id="backend-note"
>
  Connecting to application backend...
</div>

      </aside>

    </main>

  </div>
`;


/* ---------------------------------------------------------
   UI REFERENCES
   --------------------------------------------------------- */

const startButton =
  document.querySelector<HTMLButtonElement>("#start-button")!;

const stopButton =
  document.querySelector<HTMLButtonElement>("#stop-button")!;

const testApprovedButton =
  document.querySelector<HTMLButtonElement>(
    "#test-approved-button",
  )!;

const testRejectButton =
  document.querySelector<HTMLButtonElement>(
    "#test-reject-button",
  )!;

const statusDot =
  document.querySelector<HTMLSpanElement>("#status-dot")!;

const connectionText =
  document.querySelector<HTMLSpanElement>(
    "#connection-text",
  )!;

const sceneState =
  document.querySelector<HTMLDivElement>(
    "#scene-state",
  )!;

const sceneDescription =
  document.querySelector<HTMLDivElement>(
    "#scene-description",
  )!;

const imageA =
  document.querySelector<HTMLImageElement>(
    "#scene-image-a",
  )!;

const imageB =
  document.querySelector<HTMLImageElement>(
    "#scene-image-b",
  )!;

const blocksFoundValue =
  document.querySelector<HTMLElement>(
    "#blocks-found-value",
  )!;

const rejectedValue =
  document.querySelector<HTMLElement>(
    "#rejected-value",
  )!;

const sessionTimeValue =
  document.querySelector<HTMLElement>(
    "#session-time-value",
  )!;


/* ---------------------------------------------------------
   VISUAL STATE
   --------------------------------------------------------- */

let activeImage = imageA;
let inactiveImage = imageB;

let currentState: SceneState = "ready";

let transientTimer:
  ReturnType<typeof window.setTimeout> | null = null;

const transientQueue: TransientState[] = [];


/* ---------------------------------------------------------
   MINING / SESSION STATE
   --------------------------------------------------------- */

let miningRunning = false;

let blocksFound = 0;
let rejectedCount = 0;

let accumulatedMiningMs = 0;
let miningStartedAt: number | null = null;


/* ---------------------------------------------------------
   SCENE HANDLING
   --------------------------------------------------------- */

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


/* ---------------------------------------------------------
   SESSION TIMER
   --------------------------------------------------------- */

function getCurrentMiningTimeMs(): number {

  if (
    miningRunning &&
    miningStartedAt !== null
  ) {

    return (
      accumulatedMiningMs +
      (Date.now() - miningStartedAt)
    );
  }

  return accumulatedMiningMs;
}


function formatDuration(ms: number): string {

  const totalSeconds =
    Math.floor(ms / 1000);

  const weeks =
    Math.floor(
      totalSeconds / 604800,
    );

  const days =
    Math.floor(
      (totalSeconds % 604800) / 86400,
    );

  const hours =
    Math.floor(
      (totalSeconds % 86400) / 3600,
    );

  const minutes =
    Math.floor(
      (totalSeconds % 3600) / 60,
    );

  const seconds =
    totalSeconds % 60;

  const time =
    [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0"),
    ].join(":");

  if (weeks > 0) {
    return `${weeks}w ${days}d ${time}`;
  }

  if (days > 0) {
    return `${days}d ${time}`;
  }

  return time;
}


function updateSessionTimer() {

  sessionTimeValue.textContent =
    formatDuration(
      getCurrentMiningTimeMs(),
    );
}


window.setInterval(
  updateSessionTimer,
  250,
);


/* ---------------------------------------------------------
   COUNTERS
   --------------------------------------------------------- */

function updateCounters() {

  blocksFoundValue.textContent =
    blocksFound.toString();

  rejectedValue.textContent =
    rejectedCount.toString();
}


/* ---------------------------------------------------------
   TRANSIENT EVENT QUEUE
   --------------------------------------------------------- */

function clearTransientTimer() {

  if (transientTimer !== null) {

    window.clearTimeout(
      transientTimer,
    );

    transientTimer = null;
  }
}


function getTransientDuration(
  state: TransientState,
): number {

  if (state === "approved") {
    return 5500;
  }

  return 2500;
}


function playNextTransient() {

  if (!miningRunning) {
    transientQueue.length = 0;
    return;
  }

  const nextState =
    transientQueue.shift();

  if (!nextState) {
    setScene("mining");
    return;
  }

  setScene(nextState);

  transientTimer =
    window.setTimeout(
      () => {

        transientTimer = null;

        playNextTransient();

      },
      getTransientDuration(
        nextState,
      ),
    );
}


function queueTransient(
  state: TransientState,
) {

  if (!miningRunning) {
    return;
  }

  /*
    If another transient event is already
    playing, queue this event behind it.
  */
  if (transientTimer !== null) {

    transientQueue.push(state);
    return;
  }

  setScene(state);

  transientTimer =
    window.setTimeout(
      () => {

        transientTimer = null;

        playNextTransient();

      },
      getTransientDuration(state),
    );
}


/* ---------------------------------------------------------
   SIMULATED BACKEND EVENTS
   --------------------------------------------------------- */

function handleBlockFound() {

  if (!miningRunning) {
    return;
  }

  /*
    Count the event immediately.
    The visual celebration can be queued.
  */
  blocksFound += 1;

  updateCounters();

  queueTransient("approved");
}


function handleReject() {

  if (!miningRunning) {
    return;
  }

  rejectedCount += 1;

  updateCounters();

  queueTransient("reject");
}


/* ---------------------------------------------------------
   MINING MODE BUTTONS
   --------------------------------------------------------- */

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


/* ---------------------------------------------------------
   START MINING
   --------------------------------------------------------- */

startButton.addEventListener(
  "click",
  () => {

    clearTransientTimer();

    transientQueue.length = 0;

    miningRunning = true;

    miningStartedAt = Date.now();

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

    testApprovedButton.disabled = false;
    testRejectButton.disabled = false;

    updateSessionTimer();
  },
);


/* ---------------------------------------------------------
   STOP MINING
   --------------------------------------------------------- */

stopButton.addEventListener(
  "click",
  () => {

    /*
      Preserve accumulated session time.
    */
    if (
      miningRunning &&
      miningStartedAt !== null
    ) {

      accumulatedMiningMs +=
        Date.now() -
        miningStartedAt;
    }

    miningStartedAt = null;
    miningRunning = false;

    clearTransientTimer();

    /*
      The counters have already recorded
      queued events, so only the pending
      visual presentations are discarded.
    */
    transientQueue.length = 0;

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

    testApprovedButton.disabled = true;
    testRejectButton.disabled = true;

    updateSessionTimer();
  },
);


/* ---------------------------------------------------------
   DEVELOPMENT TEST BUTTONS
   --------------------------------------------------------- */

testApprovedButton.addEventListener(
  "click",
  () => {

    handleBlockFound();
  },
);


testRejectButton.addEventListener(
  "click",
  () => {

    handleReject();
  },
);


/* ---------------------------------------------------------
   INITIAL DISPLAY
   --------------------------------------------------------- */

updateCounters();
updateSessionTimer();

/* ---------------------------------------------------------
   TAURI / RUST BACKEND PROBE
   --------------------------------------------------------- */

const backendNote =
  document.querySelector<HTMLDivElement>(
    "#backend-note",
  )!;


async function probeBackend() {

  try {

    const message =
      await invoke<string>(
        "backend_probe",
      );

    backendNote.textContent =
      message;

  } catch (error) {

    backendNote.textContent =
      "Rust backend unavailable.";

    console.error(
      "Backend probe failed:",
      error,
    );
  }
}


void probeBackend();