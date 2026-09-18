import { invoke } from "@tauri-apps/api/core";

import readyScene from "./assets/scenes/READY-STOPPED.png";
import miningScene from "./assets/scenes/MINING.png";
import approvedScene from "./assets/scenes/APPROVED.png";
import rejectScene from "./assets/scenes/REJECT.png";
import offlineScene from "./assets/scenes/OFFLINE.png";

import safexWordmark from "./assets/branding/safex-gradient-logo.svg";
import blockFoundSound from "./assets/sounds/safex-block-cha-ching.wav";

import "./styles.css";

type SceneState =
  | "ready"
  | "mining"
  | "approved"
  | "reject"
  | "offline";
type TransientState = "approved" | "reject";
type MiningMode =
  | "Calm"
  | "Balanced"
  | "Full Bore";

type DaemonCheckResult = {
  valid: boolean;
  height: number | null;
  message: string;
};

const DEFAULT_DAEMON =
  "rpc.safex.org:17402";

const SETTINGS = {
  address: "safex-mine.address",
  daemon: "safex-mine.daemon",
  mode: "safex-mine.mode",
  soundMuted: "safex-mine.sound-muted",
} as const;

const blockFoundAudio =
  new Audio(blockFoundSound);

blockFoundAudio.preload =
  "auto";

blockFoundAudio.volume =
  0.65;

const scenes: Record<
  SceneState,
  {
    image: string;
    label: string;
  }
> = {
  ready: {
    image: readyScene,
    label: "READY / STOPPED",
  },

  mining: {
    image: miningScene,
    label: "MINING",
  },

  approved: {
    image: approvedScene,
    label: "BLOCK FOUND",
  },

  offline: {
  image: offlineScene,
  label: "OFFLINE",
  },

  reject: {
    image: rejectScene,
    label: "REJECTED",
  },
};


document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="app-shell">

   <header class="topbar">

  <div class="brand">
    <div class="brand-title">The Safex Mine</div>
    <div class="brand-subtitle">Safex Cash Solo Miner</div>
  </div>


  <div class="topbar-right">

    <div class="connection-status">
      <span
        class="status-dot stopped"
        id="status-dot"
      ></span>

      <span id="connection-text">
        Ready
      </span>
    </div>

    <button
      class="sound-toggle"
      id="sound-toggle"
      type="button"
      aria-label="Mute block-found sound"
      aria-pressed="false"
      title="Mute block-found sound"
    >
      <svg
        class="sound-icon sound-icon-on"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          d="M4 9v6h4l5 4V5L8 9H4zm11.5 3a3.5 3.5 0 0 0-1.5-2.87v5.74A3.5 3.5 0 0 0 15.5 12zm0-7.18v2.06A7 7 0 0 1 19 12a7 7 0 0 1-3.5 6.12v2.06A9 9 0 0 0 21 12a9 9 0 0 0-5.5-7.18z"
        />
      </svg>

      <svg
        class="sound-icon sound-icon-off"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          d="M4 9v6h4l5 4V5L8 9H4zm11.3 1.3L14 11.6l2.4 2.4-2.4 2.4 1.3 1.3 2.4-2.4 2.4 2.4 1.3-1.3L19 14l2.4-2.4-1.3-1.3-2.4 2.4-2.4-2.4z"
        />
      </svg>
    </button>

    <img
      class="safex-wordmark"
      src="${safexWordmark}"
      alt="Safex"
    />

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
                Threads
              </span>

              <strong id="threads-value">
                0
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

            <div class="stat session-stat">
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

          <div
            id="address-validation"
            class="field-validation"
          ></div>

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

            <div
             id="node-validation"
             class="field-validation"
            ></div>

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

const addressInput =
  document.querySelector<HTMLInputElement>(
    "#address",
  )!;

const addressValidation =
  document.querySelector<HTMLDivElement>(
    "#address-validation",
  )!;

const nodeInput =
  document.querySelector<HTMLInputElement>(
    "#node",
  )!;

const nodeValidation =
  document.querySelector<HTMLDivElement>(
    "#node-validation",
  )!;

const backendNote =
  document.querySelector<HTMLDivElement>(
    "#backend-note",
  )!;

const statusDot =
  document.querySelector<HTMLSpanElement>("#status-dot")!;

const connectionText =
  document.querySelector<HTMLSpanElement>(
    "#connection-text",
  )!;

const soundToggle =
  document.querySelector<HTMLButtonElement>(
    "#sound-toggle",
  )!;

const sceneState =
  document.querySelector<HTMLDivElement>(
    "#scene-state",
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

  const hashrateValue =
  document.querySelector<HTMLElement>(
    "#hashrate-value",
  )!;

  const threadsValue =
  document.querySelector<HTMLElement>(
    "#threads-value",
  )!;

/* ---------------------------------------------------------
   PERSISTENT SETTINGS
   --------------------------------------------------------- */

async function isSafexAddressValid(
  address: string,
): Promise<boolean> {

  return await invoke<boolean>(
    "validate_safex_address",
    {
      address: address.trim(),
    },
  );
}

let daemonValidationGeneration = 0;

async function validateDaemonField(
  silent = false,
): Promise<boolean> {

  const daemon =
    nodeInput.value.trim();

  const generation =
    ++daemonValidationGeneration;

  nodeInput.classList.remove(
    "input-valid",
    "input-invalid",
  );

  if (!daemon) {

    nodeValidation.textContent =
      "";

    return false;
  }

  if (!silent) {

    nodeValidation.textContent =
      "Checking Safex daemon...";

    nodeValidation.className =
      "field-validation";
  }

  try {

    const result =
      await invoke<DaemonCheckResult>(
        "validate_safex_daemon",
        {
          daemon,
        },
      );

    /*
      Ignore an old result if the user has
      typed another daemon meanwhile.
    */
    if (
      generation !== daemonValidationGeneration ||
      daemon !== nodeInput.value.trim()
    ) {
      return false;
    }

    if (
      result.valid &&
      result.height !== null
    ) {

      nodeInput.classList.add(
        "input-valid",
      );

      nodeValidation.className =
        "field-validation valid";

      nodeValidation.textContent =
        `Safex daemon online — height ${result.height.toLocaleString()}`;

      return true;
    }

    nodeInput.classList.add(
      "input-invalid",
    );

    nodeValidation.className =
      "field-validation invalid";

    nodeValidation.textContent =
      result.message;

    return false;

  } catch (error) {

    nodeInput.classList.add(
      "input-invalid",
    );

    nodeValidation.className =
      "field-validation invalid";

    nodeValidation.textContent =
      "Unable to check daemon.";

    console.error(
      "Daemon validation failed:",
      error,
    );

    return false;
  }
}

async function validateAddressField(): Promise<boolean> {

  const address =
    addressInput.value.trim();

  addressInput.classList.remove(
    "input-valid",
    "input-invalid",
  );

  if (!address) {

    addressValidation.textContent =
      "";

    return false;
  }

 if (await isSafexAddressValid(address)) {

    addressInput.classList.add(
      "input-valid",
    );

    addressValidation.textContent =
      "Valid Safex Address";

    addressValidation.className =
      "field-validation valid";

    return true;
  }

  addressInput.classList.add(
    "input-invalid",
  );

  addressValidation.textContent =
    "Invalid Safex Address";

  addressValidation.className =
    "field-validation invalid";

  return false;
}

function getSavedMode(): MiningMode {

  const saved =
    localStorage.getItem(
      SETTINGS.mode,
    );

  if (
    saved === "Calm" ||
    saved === "Balanced" ||
    saved === "Full Bore"
  ) {
    return saved;
  }

  return "Balanced";
}

let soundMuted =
  localStorage.getItem(
    SETTINGS.soundMuted,
  ) === "true";


function updateSoundToggle() {

  soundToggle.classList.toggle(
    "muted",
    soundMuted,
  );

  soundToggle.setAttribute(
    "aria-pressed",
    String(soundMuted),
  );

  const label =
    soundMuted
      ? "Enable block-found sound"
      : "Mute block-found sound";

  soundToggle.setAttribute(
    "aria-label",
    label,
  );

  soundToggle.title =
    label;
}


soundToggle.addEventListener(
  "click",
  () => {

    soundMuted =
      !soundMuted;

    localStorage.setItem(
      SETTINGS.soundMuted,
      String(soundMuted),
    );

    updateSoundToggle();
  },
);

function setActiveMode(
  mode: MiningMode,
) {

  document
    .querySelectorAll<HTMLButtonElement>(
      ".mode-button",
    )
    .forEach((button) => {

      button.classList.toggle(
        "active",
        button.dataset.mode === mode,
      );
    });
}

addressInput.addEventListener(
  "input",
  () => {
    void validateAddressField();
  },
);


addressInput.addEventListener(
  "change",
  async () => {

    const address =
      addressInput.value.trim();

    const previousAddress =
      localStorage.getItem(
        SETTINGS.address,
      ) ?? "";

    addressInput.value =
      address;

    if (await validateAddressField()) {

      if (
        previousAddress !== address
      ) {

        blocksFound = 0;
        rejectedCount = 0;
        accumulatedMiningMs = 0;
        miningStartedAt = null;

        updateCounters();
        updateSessionTimer();
      }

      localStorage.setItem(
        SETTINGS.address,
        address,
      );
    }
  },
);


let daemonValidationTimer:
  ReturnType<typeof window.setTimeout> | null = null;

let daemonRefreshTimer:
  ReturnType<typeof window.setInterval> | null = null;

nodeInput.addEventListener(
  "input",
  () => {

    if (daemonValidationTimer !== null) {
      window.clearTimeout(
        daemonValidationTimer,
      );
    }

    nodeValidation.textContent =
      "Waiting to check daemon...";

    nodeValidation.className =
      "field-validation";

    daemonValidationTimer =
      window.setTimeout(
        () => {

          daemonValidationTimer = null;

          void validateDaemonField();
        },
        700,
      );
  },
);


nodeInput.addEventListener(
  "change",
  async () => {

    if (daemonValidationTimer !== null) {

      window.clearTimeout(
        daemonValidationTimer,
      );

      daemonValidationTimer = null;
    }

    let daemon =
      nodeInput.value.trim();

    if (!daemon) {
      daemon = DEFAULT_DAEMON;
    }

    nodeInput.value =
      daemon;

    localStorage.setItem(
      SETTINGS.daemon,
      daemon,
    );

    await validateDaemonField();
  },
);

function stopDaemonRefresh() {

  if (daemonRefreshTimer !== null) {

    window.clearInterval(
      daemonRefreshTimer,
    );

    daemonRefreshTimer =
      null;
  }
}


function startDaemonRefresh() {

  stopDaemonRefresh();


  daemonRefreshTimer =
    window.setInterval(
      () => {

        if (
          !daemonOffline
        ) {
          void validateDaemonField(
            true,
          );
        }

      },
      30_000,
    );
}

function loadSettings() {

  addressInput.value =
    localStorage.getItem(
      SETTINGS.address,
    ) ?? "";

  nodeInput.value =
    localStorage.getItem(
      SETTINGS.daemon,
    ) ?? DEFAULT_DAEMON;

  setActiveMode(
    getSavedMode(),
  );
}


function setConnectionFieldsLocked(
  locked: boolean,
) {

  addressInput.readOnly = locked;
  nodeInput.readOnly = locked;
}

function setModeButtonsLocked(
  locked: boolean,
) {

  document
    .querySelectorAll<HTMLButtonElement>(
      ".mode-button",
    )
    .forEach((button) => {

      button.disabled =
        locked;
    });
}

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

let lastAcceptedTelemetry =
  0;

let lastRejectedTelemetry =
  0;

let accumulatedMiningMs = 0;
let miningStartedAt: number | null = null;

let telemetryTimer:
  ReturnType<typeof window.setInterval> | null =
  null;

let waitingForFirstHashrate =
  false;

let daemonOffline =
  false;

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

  currentState = state;
}

function formatHashrate(
  hashrateHs: number,
): string {

  if (hashrateHs >= 1_000_000) {

    return `${(
      hashrateHs /
      1_000_000
    ).toFixed(2)} MH/s`;
  }


  if (hashrateHs >= 1_000) {

    return `${(
      hashrateHs /
      1_000
    ).toFixed(2)} kH/s`;
  }


  return `${hashrateHs.toFixed(1)} H/s`;
}


function stopTelemetryPolling() {

  if (telemetryTimer !== null) {

    window.clearInterval(
      telemetryTimer,
    );

    telemetryTimer =
      null;
  }
}

function handleUnexpectedMiningStop(
  reason: string,
) {

  if (!miningRunning) {
    return;
  }


  /*
    Preserve the mining time accumulated
    before the unexpected stop.
  */
  if (
    miningStartedAt !== null
  ) {

    accumulatedMiningMs +=
      Date.now() -
      miningStartedAt;
  }


  miningStartedAt =
    null;

  miningRunning =
    false;

  daemonOffline =
    false;

  waitingForFirstHashrate =
    false;


  stopTelemetryPolling();

  clearTransientTimer();

  transientQueue.length =
    0;


  hashrateValue.textContent =
    "0 H/s";

  threadsValue.textContent =
    "0";


  setConnectionFieldsLocked(
    false,
  );

  setModeButtonsLocked(
    false,
  );


  setScene(
    "offline",
  );


  statusDot.classList.remove(
    "mining",
  );

  statusDot.classList.add(
    "stopped",
  );


  connectionText.textContent =
    "Offline";


  startButton.disabled =
    false;

  stopButton.disabled =
    true;

  backendNote.textContent =
    `Mining stopped unexpectedly: ${reason}`;


  updateSessionTimer();
}

function handleDaemonOffline() {

  if (
    !miningRunning ||
    daemonOffline
  ) {
    return;
  }


  /*
    XMRig itself is still alive.
    Keep the mining session and telemetry
    polling running while it reconnects.
  */
  daemonOffline =
    true;

  waitingForFirstHashrate =
    false;


  clearTransientTimer();

  transientQueue.length =
    0;


  hashrateValue.textContent =
    "0 H/s";


  setScene(
    "offline",
  );


  statusDot.classList.remove(
    "mining",
  );

  statusDot.classList.add(
    "stopped",
  );


  connectionText.textContent =
    "Offline";

    nodeInput.classList.remove(
  "input-valid",
  );

  nodeInput.classList.add(
    "input-invalid",
  );


  nodeValidation.className =
    "field-validation invalid";

  nodeValidation.textContent =
    "Connection lost";

  /*
    Do not enable Start. XMRig is still
    running and attempting to reconnect.
  */
  startButton.disabled =
    true;

  stopButton.disabled =
    false;

  backendNote.textContent =
    "Safex daemon connection lost. Waiting to reconnect...";
}


function handleDaemonReconnected() {

  if (
    !miningRunning ||
    !daemonOffline
  ) {
    return;
  }


  daemonOffline =
    false;

  /*
    Wait for a fresh speed report rather
    than displaying the old pre-disconnect
    hashrate.
  */
  waitingForFirstHashrate =
    true;

  hashrateValue.textContent =
    "Resuming…";


  setScene(
    "mining",
  );


  statusDot.classList.remove(
    "stopped",
  );

  statusDot.classList.add(
    "mining",
  );


  connectionText.textContent =
    "Mining";

    void validateDaemonField();

   backendNote.textContent =
    "Safex daemon connection restored. Mining resumed.";
}

async function refreshMiningTelemetry() {

  if (!miningRunning) {
    return;
  }


  try {

    const status =
      await invoke<string>(
        "xmrig_test_status",
      );

    if (
      status.includes(
        "DAEMON=DISCONNECTED",
      )
    ) {

      handleDaemonOffline();

    } else if (
      status.includes(
        "DAEMON=CONNECTED",
      ) &&
      daemonOffline
    ) {

      handleDaemonReconnected();
    }

    const match =
      status.match(
        /HASHRATE_HS=([0-9]+(?:\.[0-9]+)?)/,
      );

    const threadsMatch =
      status.match(
        /THREADS=([0-9]+)/,
      );

    const acceptedMatch =
      status.match(
        /ACCEPTED=([0-9]+)/,
      );

    const rejectedMatch =
      status.match(
        /REJECTED=([0-9]+)/,
      );

    if (
      match &&
      !daemonOffline
    ) {

      const hashrate =
        Number(
          match[1],
        );


      if (
        Number.isFinite(
          hashrate,
        )
      ) {

        if (
          waitingForFirstHashrate &&
          hashrate > 0
        ) {

          waitingForFirstHashrate =
            false;

          connectionText.textContent =
            "Mining";
        }


        if (
          !waitingForFirstHashrate
        ) {

          hashrateValue.textContent =
            formatHashrate(
              hashrate,
            );
        }
      }
    }

    if (threadsMatch) {

      threadsValue.textContent =
        threadsMatch[1];
    }

    if (acceptedMatch) {

      const accepted =
        Number(
          acceptedMatch[1],
        );


      if (
        Number.isInteger(
          accepted,
        )
      ) {

        if (
          accepted <
          lastAcceptedTelemetry
        ) {

          lastAcceptedTelemetry =
            accepted;

        } else {

          const newAccepted =
            accepted -
            lastAcceptedTelemetry;


          lastAcceptedTelemetry =
            accepted;


          for (
            let index = 0;
            index < newAccepted;
            index += 1
          ) {

            handleBlockFound();
          }
        }
      }
    }


    if (rejectedMatch) {

      const rejected =
        Number(
          rejectedMatch[1],
        );


      if (
        Number.isInteger(
          rejected,
        )
      ) {

        if (
          rejected <
          lastRejectedTelemetry
        ) {

          lastRejectedTelemetry =
            rejected;

        } else {

          const newRejected =
            rejected -
            lastRejectedTelemetry;


          lastRejectedTelemetry =
            rejected;


          for (
            let index = 0;
            index < newRejected;
            index += 1
          ) {

            handleReject();
          }
        }
  }
}

  if (
    status.startsWith(
      "STATUS EXITED",
    )
  ) {

    handleUnexpectedMiningStop(
      status,
    );

    return;
  }


  if (
    status ===
    "STATUS IDLE"
  ) {

    handleUnexpectedMiningStop(
      "XMRig is no longer running.",
    );

    return;
  }

  } catch (error) {

    console.error(
      "Mining telemetry update failed:",
      error,
    );


    handleUnexpectedMiningStop(
      String(error),
    );
  }
}


function startTelemetryPolling() {

  stopTelemetryPolling();


  void refreshMiningTelemetry();


  telemetryTimer =
    window.setInterval(
      () => {
        void refreshMiningTelemetry();
      },
      2000,
    );
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

  if (!soundMuted) {

    blockFoundAudio.currentTime =
      0;

    void blockFoundAudio
      .play()
      .catch((error) => {

        console.error(
          "Unable to play block-found sound:",
          error,
        );
      });
  }

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
        const mode =
  button.dataset.mode as MiningMode;

localStorage.setItem(
  SETTINGS.mode,
  mode,
);
      },
    );
  });


/* ---------------------------------------------------------
   START MINING
   --------------------------------------------------------- */

startButton.addEventListener(
  "click",
  async () => {

    clearTransientTimer();

    transientQueue.length = 0;

    startButton.disabled =
      true;

    try {

      if (!(await validateAddressField())) {

        addressInput.focus();

        backendNote.textContent =
          "Enter a valid Safex Address before starting.";

        return;
      }


      if (!(await validateDaemonField())) {

        nodeInput.focus();

        backendNote.textContent =
          "A live Safex daemon is required before mining can start.";

        return;
      }


      backendNote.textContent =
        "Waiting for Administrator approval...";


      /*
        Start or reuse the persistent elevated
        helper. Once it exists, Stop -> Start
        does not cause another UAC prompt.
      */
      await invoke<string>(
        "start_helper_session",
      );


      backendNote.textContent =
        "Starting Safex XMRig...";


      const mode =
        getSavedMode();

      const result =
        await invoke<string>(
          "start_xmrig_test",
          {
            address:
              addressInput.value.trim(),

            daemon:
              nodeInput.value.trim(),

            mode,
          },
        );

      const started =
        result.startsWith(
          "OK STARTED",
        )
        ||
        result.startsWith(
          "OK ALREADY_ACTIVE",
        );


      if (!started) {

        throw new Error(
          result,
        );
      }


      /*
        Only change the visible application
        state after the real miner has
        successfully started.
      */
      miningRunning =
        true;

      daemonOffline =
        false;

      lastAcceptedTelemetry =
        0;

      lastRejectedTelemetry =
        0;

      waitingForFirstHashrate =
        true;

      hashrateValue.textContent =
        "Starting…";

      connectionText.textContent =
        "Launching miner…";

      setConnectionFieldsLocked(
        true,
      );

      setModeButtonsLocked(
        true,
      );

      miningStartedAt =
        Date.now();


      setScene(
        "mining",
      );


      statusDot.classList.remove(
        "stopped",
      );

      statusDot.classList.add(
        "mining",
      );


      startButton.disabled =
        true;

      stopButton.disabled =
        false;


    if (
      result.includes(
        "STARTED_DEGRADED",
      )
      ||
      result.includes(
        "MSR=UNAVAILABLE",
      )
    ) {

      backendNote.textContent =
        `Mining started — ${mode} mode. MSR optimisation unavailable; reduced hashrate expected.`;

    } else {

      backendNote.textContent =
        `Mining started — ${mode} mode. MSR optimisation active.`;
    }


      updateSessionTimer();
      startTelemetryPolling();

    } catch (error) {

      /*
        A failed backend start must never
        leave the UI pretending that mining
        is running.
      */
      miningRunning =
        false;

      waitingForFirstHashrate =
        false;

      miningStartedAt =
        null;


      setConnectionFieldsLocked(
        false,
      );

      setModeButtonsLocked(
        false,
      );

      setScene(
        "ready",
      );


      statusDot.classList.remove(
        "mining",
      );

      statusDot.classList.add(
        "stopped",
      );

      stopTelemetryPolling();

        hashrateValue.textContent =
          "0 H/s";

        threadsValue.textContent =
            "0";


      connectionText.textContent =
        "Ready";


      stopButton.disabled =
        true;


      backendNote.textContent =
        `Unable to start mining: ${String(error)}`;

    } finally {

      if (!miningRunning) {

        startButton.disabled =
          false;
      }
    }
  },
);

/* ---------------------------------------------------------
   STOP MINING
   --------------------------------------------------------- */

stopButton.addEventListener(
  "click",
  async () => {

    if (!miningRunning) {
      return;
    }


    stopButton.disabled =
      true;


    backendNote.textContent =
      "Stopping Safex XMRig gracefully...";


    try {

      const result =
        await invoke<string>(
          "stop_xmrig_test",
        );


      /*
        The helper has confirmed that XMRig
        has stopped. Now update the visible
        application/session state.
      */
      if (
        miningStartedAt !== null
      ) {

        accumulatedMiningMs +=
          Date.now() -
          miningStartedAt;
      }


      miningStartedAt =
        null;

      miningRunning =
        false;

      daemonOffline =
        false;

      waitingForFirstHashrate =
        false;

        stopTelemetryPolling();

          hashrateValue.textContent =
            "0 H/s";

          threadsValue.textContent =
            "0";


      setConnectionFieldsLocked(
        false,
      );

      setModeButtonsLocked(
        false,
      );

      clearTransientTimer();


      /*
        Counters have already recorded any
        queued events. Only pending visual
        presentations are discarded.
      */
      transientQueue.length =
        0;


      setScene(
        "ready",
      );


      statusDot.classList.remove(
        "mining",
      );

      statusDot.classList.add(
        "stopped",
      );


      connectionText.textContent =
        "Ready";


      startButton.disabled =
        false;

      stopButton.disabled =
        true;


      if (
        result.includes(
          "STOPPED_FORCED",
        )
      ) {

        backendNote.textContent =
          "Mining stopped, but XMRig required forced termination.";

      } else {

        backendNote.textContent =
          "Mining stopped cleanly. Elevated helper remains ready.";
      }


      updateSessionTimer();

    } catch (error) {

      /*
        If STOP failed, do not claim that
        mining has stopped. The process may
        still be alive.
      */
      backendNote.textContent =
        `Unable to stop mining: ${String(error)}`;


      stopButton.disabled =
        false;
    }
  },
);

/* ---------------------------------------------------------
   INITIAL DISPLAY
   --------------------------------------------------------- */

updateCounters();
updateSessionTimer();

loadSettings();
updateSoundToggle();

void validateAddressField();
void validateDaemonField();

startDaemonRefresh();

setConnectionFieldsLocked(
  false,
);

/* ---------------------------------------------------------
   TAURI / RUST BACKEND PROBE
   --------------------------------------------------------- */

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