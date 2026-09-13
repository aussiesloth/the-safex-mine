import "./styles.css";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="app-shell">
    <header class="topbar">
      <div class="brand">
        <div class="brand-title">The Safex Mine</div>
        <div class="brand-subtitle">Safex Cash Solo Miner</div>
      </div>

      <div class="connection-status">
        <span class="status-dot stopped" id="status-dot"></span>
        <span id="connection-text">Ready</span>
      </div>
    </header>

    <main class="workspace">
      <section class="mine-panel">
        <div class="scene-placeholder" id="scene">
          <div class="scene-state">READY / STOPPED</div>
          <div class="scene-description">
            Miner seated in chair
          </div>
        </div>
      </section>

      <aside class="control-panel">
        <section class="panel-section">
          <h2>Mining Status</h2>

          <div class="stat-grid">
            <div class="stat">
              <span class="stat-label">Hashrate</span>
              <strong>0 H/s</strong>
            </div>

            <div class="stat">
              <span class="stat-label">Blocks Found</span>
              <strong>0</strong>
            </div>

            <div class="stat">
              <span class="stat-label">Rejected</span>
              <strong>0</strong>
            </div>

            <div class="stat">
              <span class="stat-label">Session</span>
              <strong>00:00:00</strong>
            </div>
          </div>
        </section>

        <section class="panel-section">
          <h2>Mining Mode</h2>

          <div class="mode-buttons">
            <button class="mode-button" data-mode="Calm">Calm</button>
            <button class="mode-button active" data-mode="Balanced">
              Balanced
            </button>
            <button class="mode-button" data-mode="Full Bore">
              Full Bore
            </button>
          </div>
        </section>

        <section class="panel-section">
          <h2>Connection</h2>

          <div class="field">
            <label for="address">Safex Cash Address</label>
            <input
              id="address"
              type="text"
              placeholder="Enter mining address"
            />
          </div>

          <div class="field">
            <label for="node">Node / RPC</label>
            <input
              id="node"
              type="text"
              placeholder="Default public node"
            />
          </div>
        </section>

        <section class="mining-controls">
          <button id="start-button" class="primary-button">
            Start Mining
          </button>

          <button id="stop-button" class="secondary-button" disabled>
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

const scene = document.querySelector<HTMLDivElement>("#scene")!;
const statusDot = document.querySelector<HTMLSpanElement>("#status-dot")!;
const connectionText =
  document.querySelector<HTMLSpanElement>("#connection-text")!;

document.querySelectorAll<HTMLButtonElement>(".mode-button").forEach(
  (button) => {
    button.addEventListener("click", () => {
      document
        .querySelectorAll(".mode-button")
        .forEach((item) => item.classList.remove("active"));

      button.classList.add("active");
    });
  },
);

startButton.addEventListener("click", () => {
  scene.innerHTML = `
    <div class="scene-state">MINING</div>
    <div class="scene-description">
      Miner working the rockface
    </div>
  `;

  statusDot.classList.remove("stopped");
  statusDot.classList.add("mining");
  connectionText.textContent = "Mining";

  startButton.disabled = true;
  stopButton.disabled = false;
});

stopButton.addEventListener("click", () => {
  scene.innerHTML = `
    <div class="scene-state">READY / STOPPED</div>
    <div class="scene-description">
      Miner seated in chair
    </div>
  `;

  statusDot.classList.remove("mining");
  statusDot.classList.add("stopped");
  connectionText.textContent = "Ready";

  startButton.disabled = false;
  stopButton.disabled = true;
});