import { getCurrentWindow } from "@tauri-apps/api/window";

import "./riskAcknowledgement.css";

const ACKNOWLEDGEMENT_VERSION = "1.0";
const ACKNOWLEDGEMENT_KEY =
  "safex-mine.mining-risk-acknowledgement-version";

const ACKNOWLEDGEMENT_HTML = `
  <p>
    The Safex Mine is a community-developed application for solo mining
    <strong>Safex Cash (SFX)</strong>. Before using the mining functions,
    please read and acknowledge the following information.
  </p>

  <h3>Mining rewards and value</h3>

  <p>
    Cryptocurrency mining is speculative. The Safex Mine does not guarantee
    that your computer will find a block, receive any mining reward, operate
    profitably, or recover the cost of electricity or equipment.
  </p>

  <p>
    Safex Cash may increase or decrease in value and may have little or no
    real-world market value at any particular time. Past mining results do not
    indicate or guarantee future results.
  </p>

  <p>
    The Safex Mine does not provide financial, investment, taxation or legal
    advice.
  </p>

  <h3>Hardware load, heat and power consumption</h3>

  <p>
    Cryptocurrency mining can place a sustained load on your CPU and other
    computer components. This can increase:
  </p>

  <ul>
    <li>processor temperature and system heat;</li>
    <li>fan speed and cooling-system use;</li>
    <li>electricity consumption;</li>
    <li>load on motherboard power-delivery components; and</li>
    <li>general hardware wear during prolonged operation.</li>
  </ul>

  <p>
    You are responsible for deciding whether your computer, cooling system and
    power supply are suitable for sustained mining and for monitoring your
    system as appropriate.
  </p>

  <p>
    Use of cryptocurrency-mining software may affect coverage under a
    manufacturer's voluntary warranty depending on that manufacturer's
    warranty terms and the circumstances of any failure. This acknowledgement
    does not affect any statutory rights or remedies that cannot lawfully be
    excluded.
  </p>

  <h3>Windows security and elevated access</h3>

  <p>
    The Safex Mine includes a Safex-compatible XMRig mining backend, an
    elevated helper and the WinRing driver used to attempt Windows MSR
    performance optimisation.
  </p>

  <p>
    These components may be detected, blocked or quarantined by Microsoft
    Defender, Windows SmartScreen or other security software.
  </p>

  <p>
    The Safex Mine will not automatically disable antivirus protection,
    restore quarantined files or create antivirus exclusions. Any decision to
    restore a detected file, create an exclusion or temporarily alter
    security-software settings remains yours.
  </p>

  <p>
    Starting mining requires approval of a Windows UAC prompt for the elevated
    mining helper. The graphical application itself is intended to continue
    running without Administrator privileges.
  </p>

  <p>
    Windows security features may prevent MSR optimisation. Mining may continue
    with reduced performance when this occurs. You are not required to disable
    Windows security features simply to obtain higher mining performance.
  </p>

  <h3>System stability and data</h3>

  <p>
    Sustained high CPU load can contribute to system instability on systems
    with inadequate cooling, unstable hardware, overclocking, power problems
    or other existing issues.
  </p>

  <p>
    Before prolonged or unattended mining, you should ensure that important
    data is backed up and that your computer is operating reliably.
  </p>

  <p>
    No software can guarantee that crashes, data loss, hardware faults or other
    system problems will never occur.
  </p>

  <h3>Mining configuration</h3>

  <p>
    You are responsible for the Safex Cash address and daemon configuration
    entered into the application.
  </p>

  <p>
    You should confirm that the mining address is correct before starting. The
    developer cannot recover cryptocurrency sent or credited to an incorrect
    address.
  </p>

  <p>
    You remain responsible for complying with any laws, taxation requirements,
    electricity agreements or other obligations that apply to your use of
    cryptocurrency mining.
  </p>

  <h3>No guarantee of performance</h3>

  <p>
    Hashrate and mining performance vary between computers and can be affected
    by CPU architecture, memory configuration, cooling, power limits, Windows
    security features and other software running on the system.
  </p>

  <p>
    The Calm, Balanced and Full Bore profiles control the amount of CPU
    resource made available to the miner. They do not guarantee any particular
    hashrate, reward rate or profitability.
  </p>

  <h3>Software warranty and liability</h3>

  <p>
    The Safex Mine is provided under the
    <strong>GNU General Public License v3.0 (GPL-3.0)</strong> and is provided
    without warranties beyond those that cannot lawfully be excluded.
  </p>

  <p>
    To the maximum extent permitted by applicable law, no guarantee is made
    that the software will be error-free, uninterrupted, compatible with every
    computer, or free from adverse interactions with other software or
    hardware.
  </p>

  <p>
    To the maximum extent permitted by applicable law, the developer is not
    responsible for loss or damage arising from a user's decision to operate
    cryptocurrency-mining software, including losses associated with hardware
    operation, heat, electricity consumption, system instability, data loss,
    interrupted computer use, missed mining rewards or changes in
    cryptocurrency value.
  </p>

  <p class="risk-acknowledgement-emphasis">
    Nothing in this acknowledgement excludes, restricts or modifies any right,
    guarantee or remedy that cannot lawfully be excluded, restricted or
    modified.
  </p>

  <p>
    This acknowledgement does not replace, alter or impose additional
    restrictions on the GPL-3.0 licence or the licences applicable to
    third-party components included with The Safex Mine.
  </p>
`;

let overlay: HTMLDivElement | null = null;
let acknowledgementButton: HTMLButtonElement | null = null;

function hasAcknowledgedCurrentVersion(): boolean {
  return (
    localStorage.getItem(ACKNOWLEDGEMENT_KEY) ===
    ACKNOWLEDGEMENT_VERSION
  );
}

function setMainApplicationInert(inert: boolean) {
  const appShell =
    document.querySelector<HTMLElement>(".app-shell");

  if (appShell) {
    appShell.inert = inert;
  }
}

function closeAcknowledgement() {
  if (!overlay) {
    return;
  }

  overlay.hidden = true;
  setMainApplicationInert(false);

  acknowledgementButton?.focus();
}

async function exitApplication() {
  try {
    await getCurrentWindow().close();
  } catch (error) {
    console.error(
      "Unable to close The Safex Mine window:",
      error,
    );
  }
}

function showAcknowledgement(firstRun: boolean) {
  if (!overlay) {
    return;
  }

  const checkbox =
    overlay.querySelector<HTMLInputElement>(
      "#risk-acknowledgement-checkbox",
    );

  const firstRunControls =
    overlay.querySelector<HTMLElement>(
      ".risk-acknowledgement-first-run-controls",
    );

  const reviewControls =
    overlay.querySelector<HTMLElement>(
      ".risk-acknowledgement-review-controls",
    );

  const continueButton =
    overlay.querySelector<HTMLButtonElement>(
      "#risk-acknowledgement-continue",
    );

  if (checkbox) {
    checkbox.checked = false;
  }

  if (continueButton) {
    continueButton.disabled = true;
  }

  if (firstRunControls) {
    firstRunControls.hidden = !firstRun;
  }

  if (reviewControls) {
    reviewControls.hidden = firstRun;
  }

  overlay.hidden = false;
  setMainApplicationInert(true);

  const scrollArea =
    overlay.querySelector<HTMLElement>(
      ".risk-acknowledgement-content",
    );

  if (scrollArea) {
    scrollArea.scrollTop = 0;
  }

  window.setTimeout(() => {
    if (firstRun) {
      checkbox?.focus();
    } else {
      overlay
        ?.querySelector<HTMLButtonElement>(
          "#risk-acknowledgement-close",
        )
        ?.focus();
    }
  }, 0);
}

function buildAcknowledgementUi() {
  overlay = document.createElement("div");
  overlay.className = "risk-acknowledgement-overlay";
  overlay.hidden = true;

  overlay.innerHTML = `
    <section
      class="risk-acknowledgement-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="risk-acknowledgement-title"
    >
      <header class="risk-acknowledgement-header">
        <div>
          <div class="risk-acknowledgement-kicker">
            Before you begin
          </div>
          <h2 id="risk-acknowledgement-title">
            Mining Risk Acknowledgement
          </h2>
          <div class="risk-acknowledgement-version">
            The Safex Mine — Version ${ACKNOWLEDGEMENT_VERSION}
          </div>
        </div>
      </header>

      <div class="risk-acknowledgement-content">
        ${ACKNOWLEDGEMENT_HTML}
      </div>

      <footer class="risk-acknowledgement-footer">
        <div class="risk-acknowledgement-first-run-controls">
          <label class="risk-acknowledgement-check">
            <input
              id="risk-acknowledgement-checkbox"
              type="checkbox"
            />
            <span>
              I have read and understand the Mining Risk Acknowledgement above
              and choose to continue.
            </span>
          </label>

          <div class="risk-acknowledgement-actions">
            <button
              id="risk-acknowledgement-exit"
              class="risk-button risk-button-secondary"
              type="button"
            >
              Exit
            </button>

            <button
              id="risk-acknowledgement-continue"
              class="risk-button risk-button-primary"
              type="button"
              disabled
            >
              Acknowledge and Continue
            </button>
          </div>
        </div>

        <div
          class="risk-acknowledgement-review-controls"
          hidden
        >
          <button
            id="risk-acknowledgement-close"
            class="risk-button risk-button-primary"
            type="button"
          >
            Close
          </button>
        </div>
      </footer>
    </section>
  `;

  document.body.append(overlay);

  const checkbox =
    overlay.querySelector<HTMLInputElement>(
      "#risk-acknowledgement-checkbox",
    )!;

  const continueButton =
    overlay.querySelector<HTMLButtonElement>(
      "#risk-acknowledgement-continue",
    )!;

  checkbox.addEventListener("change", () => {
    continueButton.disabled = !checkbox.checked;
  });

  continueButton.addEventListener("click", () => {
    if (!checkbox.checked) {
      return;
    }

    localStorage.setItem(
      ACKNOWLEDGEMENT_KEY,
      ACKNOWLEDGEMENT_VERSION,
    );

    closeAcknowledgement();
  });

  overlay
    .querySelector<HTMLButtonElement>(
      "#risk-acknowledgement-exit",
    )!
    .addEventListener("click", () => {
      void exitApplication();
    });

  overlay
    .querySelector<HTMLButtonElement>(
      "#risk-acknowledgement-close",
    )!
    .addEventListener("click", () => {
      closeAcknowledgement();
    });
}

function addPermanentAcknowledgementButton() {
  const topbarRight =
    document.querySelector<HTMLElement>(".topbar-right");

  if (!topbarRight) {
    return;
  }

  acknowledgementButton =
    document.createElement("button");

  acknowledgementButton.type = "button";
  acknowledgementButton.className =
    "risk-acknowledgement-link";
  acknowledgementButton.textContent =
    "Risk notice";
  acknowledgementButton.title =
    "View Mining Risk Acknowledgement";

  acknowledgementButton.addEventListener(
    "click",
    () => {
      showAcknowledgement(false);
    },
  );

  const soundToggle =
    topbarRight.querySelector(".sound-toggle");

  topbarRight.insertBefore(
    acknowledgementButton,
    soundToggle,
  );
}

function initializeRiskAcknowledgement() {
  buildAcknowledgementUi();
  addPermanentAcknowledgementButton();

  if (!hasAcknowledgedCurrentVersion()) {
    showAcknowledgement(true);
  }
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeRiskAcknowledgement,
    { once: true },
  );
} else {
  initializeRiskAcknowledgement();
}
