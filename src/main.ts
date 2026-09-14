import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

import readyScene from "./assets/scenes/READY-STOPPED.png";
import miningScene from "./assets/scenes/MINING.png";
import approvedScene from "./assets/scenes/APPROVED.png";
import rejectScene from "./assets/scenes/REJECT.png";

import "./styles.css";

type SceneState = "ready" | "mining" | "approved" | "reject";
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
} as const;

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
              id="test-xmrig-version-button"
              class="test-button"
            >
              Test Safex XMRig
            </button>

            <button
              id="test-reject-button"
              class="test-button"
              disabled
            >
              Test Reject
            </button>

            <button
              id="test-process-start-button"
              class="test-button"
            >
              Start Test Process
            </button>

            <button
              id="test-process-stop-button"
              class="test-button"
            >
              Stop Test Process
            </button>
            
            <button
              id="test-elevated-helper-button"
              class="test-button"
            >
              Test Elevated Helper
            </button>

            <button
              id="test-secure-pipe-button"
              class="test-button"
            >
              Test Secure Helper Pipe
            </button>

            <button
              id="start-helper-session-button"
              class="test-button"
            >
              Start Helper Session
            </button>

            <button
              id="test-helper-commands-button"
              class="test-button"
            >
              Test Helper Commands
            </button>

            <button
              id="start-xmrig-test-button"
              class="test-button"
            >
              Start XMRig Test
            </button>

            <button
              id="xmrig-test-status-button"
              class="test-button"
            >
              XMRig Status
            </button>

            <button
              id="stop-xmrig-test-button"
              class="test-button"
            >
              Stop XMRig Test
            </button>

            <button
              id="shutdown-helper-session-button"
              class="test-button"
            >
              Shutdown Helper
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

const testXmrigVersionButton =
  document.querySelector<HTMLButtonElement>(
    "#test-xmrig-version-button",
  )!;

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

const testApprovedButton =
  document.querySelector<HTMLButtonElement>(
    "#test-approved-button",
  )!;

const testRejectButton =
  document.querySelector<HTMLButtonElement>(
    "#test-reject-button",
  )!;

const testProcessStartButton =
  document.querySelector<HTMLButtonElement>(
    "#test-process-start-button",
  )!;

const testProcessStopButton =
  document.querySelector<HTMLButtonElement>(
    "#test-process-stop-button",
  )!;

  const testElevatedHelperButton =
  document.querySelector<HTMLButtonElement>(
    "#test-elevated-helper-button",
  )!;

  const testSecurePipeButton =
  document.querySelector<HTMLButtonElement>(
    "#test-secure-pipe-button",
  )!;

  const startHelperSessionButton =
  document.querySelector<HTMLButtonElement>(
    "#start-helper-session-button",
  )!;

const testHelperCommandsButton =
  document.querySelector<HTMLButtonElement>(
    "#test-helper-commands-button",
  )!;

const startXmrigTestButton =
  document.querySelector<HTMLButtonElement>(
    "#start-xmrig-test-button",
  )!;

const xmrigTestStatusButton =
  document.querySelector<HTMLButtonElement>(
    "#xmrig-test-status-button",
  )!;

const stopXmrigTestButton =
  document.querySelector<HTMLButtonElement>(
    "#stop-xmrig-test-button",
  )!;

const shutdownHelperSessionButton =
  document.querySelector<HTMLButtonElement>(
    "#shutdown-helper-session-button",
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

async function validateDaemonField(): Promise<boolean> {

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

  nodeValidation.textContent =
    "Checking Safex daemon...";

  nodeValidation.className =
    "field-validation";

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

    addressInput.value =
      address;

    if (await validateAddressField()) {

      localStorage.setItem(
        SETTINGS.address,
        address,
      );
    }
  },
);


let daemonValidationTimer:
  ReturnType<typeof window.setTimeout> | null = null;


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


      connectionText.textContent =
        "Mining";


      startButton.disabled =
        true;

      stopButton.disabled =
        false;


      testApprovedButton.disabled =
        false;

      testRejectButton.disabled =
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

    } catch (error) {

      /*
        A failed backend start must never
        leave the UI pretending that mining
        is running.
      */
      miningRunning =
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


      connectionText.textContent =
        "Ready";


      stopButton.disabled =
        true;


      testApprovedButton.disabled =
        true;

      testRejectButton.disabled =
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


      testApprovedButton.disabled =
        true;

      testRejectButton.disabled =
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
   NATIVE PROCESS-MANAGER TEST
   --------------------------------------------------------- */

testProcessStartButton.addEventListener(
  "click",
  async () => {

    try {

      const result =
        await invoke<string>(
          "start_test_process",
        );

      backendNote.textContent =
        result;

    } catch (error) {

      backendNote.textContent =
        String(error);
    }
  },
);


testProcessStopButton.addEventListener(
  "click",
  async () => {

    try {

      const result =
        await invoke<string>(
          "stop_test_process",
        );

      backendNote.textContent =
        result;

    } catch (error) {

      backendNote.textContent =
        String(error);
    }
  },
);


void listen<string>(
  "test-process-output",
  (event) => {

    backendNote.textContent =
      `Test process: ${event.payload}`;
  },
);


void listen<string>(
  "test-process-error",
  (event) => {

    backendNote.textContent =
      `Test process error: ${event.payload}`;
  },
);

testElevatedHelperButton.addEventListener(
  "click",
  async () => {

    testElevatedHelperButton.disabled =
      true;

    backendNote.textContent =
      "Waiting for Administrator approval...";

    try {

      const result =
        await invoke<string>(
          "launch_helper_probe",
        );

      backendNote.textContent =
        result;

    } catch (error) {

      backendNote.textContent =
        String(error);
    }

    testElevatedHelperButton.disabled =
      false;
  },
);

testSecurePipeButton.addEventListener(
  "click",
  async () => {

    testSecurePipeButton.disabled =
      true;

    backendNote.textContent =
      "Waiting for secure elevated helper connection...";

    try {

      const result =
        await invoke<string>(
          "test_secure_helper_pipe",
        );

      backendNote.textContent =
        result;

    } catch (error) {

      backendNote.textContent =
        String(error);
    }

    testSecurePipeButton.disabled =
      false;
  },
);

startHelperSessionButton.addEventListener(
  "click",
  async () => {

    startHelperSessionButton.disabled =
      true;

    backendNote.textContent =
      "Waiting for Administrator approval...";

    try {

      backendNote.textContent =
        await invoke<string>(
          "start_helper_session",
        );

    } catch (error) {

      backendNote.textContent =
        String(error);
    }

    startHelperSessionButton.disabled =
      false;
  },
);


testHelperCommandsButton.addEventListener(
  "click",
  async () => {

    try {

      backendNote.textContent =
        await invoke<string>(
          "test_helper_commands",
        );

    } catch (error) {

      backendNote.textContent =
        String(error);
    }
  },
);

startXmrigTestButton.addEventListener(
  "click",
  async () => {

    startXmrigTestButton.disabled =
      true;

    try {

      if (!(await validateAddressField())) {

        backendNote.textContent =
          "Enter a valid Safex Address before testing XMRig.";

        addressInput.focus();

        return;
      }


      if (!(await validateDaemonField())) {

        backendNote.textContent =
          "A live Safex daemon is required before testing XMRig.";

        nodeInput.focus();

        return;
      }


      backendNote.textContent =
        "Waiting for Administrator approval...";


      /*
        Ensure the persistent elevated helper
        exists. If already connected this does
        not cause another UAC prompt.
      */
      await invoke<string>(
        "start_helper_session",
      );


      backendNote.textContent =
        "Starting Safex XMRig and verifying MSR optimisation...";


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


      backendNote.textContent =
        result;

    } catch (error) {

      backendNote.textContent =
        String(error);

    } finally {

      startXmrigTestButton.disabled =
        false;
    }
  },
);


xmrigTestStatusButton.addEventListener(
  "click",
  async () => {

    try {

      backendNote.textContent =
        await invoke<string>(
          "xmrig_test_status",
        );

    } catch (error) {

      backendNote.textContent =
        String(error);
    }
  },
);


stopXmrigTestButton.addEventListener(
  "click",
  async () => {

    stopXmrigTestButton.disabled =
      true;

    try {

      backendNote.textContent =
        "Stopping Safex XMRig gracefully...";


      backendNote.textContent =
        await invoke<string>(
          "stop_xmrig_test",
        );

    } catch (error) {

      backendNote.textContent =
        String(error);

    } finally {

      stopXmrigTestButton.disabled =
        false;
    }
  },
);

shutdownHelperSessionButton.addEventListener(
  "click",
  async () => {

    try {

      backendNote.textContent =
        await invoke<string>(
          "shutdown_helper_session",
        );

    } catch (error) {

      backendNote.textContent =
        String(error);
    }
  },
);

/* ---------------------------------------------------------
   INITIAL DISPLAY
   --------------------------------------------------------- */

updateCounters();
updateSessionTimer();

loadSettings();

void validateAddressField();
void validateDaemonField();

setConnectionFieldsLocked(
  false,
);

/* ---------------------------------------------------------
   SAFEX XMRIG VERSION TEST
   --------------------------------------------------------- */

testXmrigVersionButton.addEventListener(
  "click",
  async () => {

    try {

      const result =
        await invoke<string>(
          "safex_xmrig_version",
        );

      backendNote.textContent =
        result.replace(/\r?\n/g, " | ");

    } catch (error) {

      backendNote.textContent =
        String(error);
    }
  },
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