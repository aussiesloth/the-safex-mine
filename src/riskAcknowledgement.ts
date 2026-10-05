import { getCurrentWindow } from "@tauri-apps/api/window";

import {
  getUiLocale,
  translate,
} from "./i18n";
import { createLanguageSelector } from "./i18n/languageSelector";
import {
  initializeUiLanguage,
  onUiLanguageChanged,
} from "./i18n/runtime";
import {
  getRiskAcknowledgement,
  type RiskContentBlock,
  type RiskTextSegment,
} from "./i18n/riskAcknowledgements";
import "./riskAcknowledgement.css";

await initializeUiLanguage();

const ACKNOWLEDGEMENT_VERSION = "1.0";
const ACKNOWLEDGEMENT_KEY =
  "safex-mine.mining-risk-acknowledgement-version";

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

function appendSegments(
  target: HTMLElement,
  segments: readonly RiskTextSegment[],
) {
  for (const segment of segments) {
    if (segment.strong) {
      const strong = document.createElement("strong");
      strong.textContent = segment.text;
      target.append(strong);
    } else {
      target.append(document.createTextNode(segment.text));
    }
  }
}

function appendContentBlock(
  target: HTMLElement,
  block: RiskContentBlock,
) {
  if (block.type === "paragraph") {
    const paragraph = document.createElement("p");

    if (block.emphasis) {
      paragraph.className =
        "risk-acknowledgement-emphasis";
    }

    appendSegments(paragraph, block.segments);
    target.append(paragraph);
    return;
  }

  if (block.type === "list") {
    const list = document.createElement("ul");

    for (const item of block.items) {
      const listItem = document.createElement("li");
      appendSegments(listItem, item.segments);
      list.append(listItem);
    }

    target.append(list);
    return;
  }

  const heading = document.createElement("h3");
  heading.textContent = block.heading;
  target.append(heading);

  for (const nestedBlock of block.blocks) {
    appendContentBlock(target, nestedBlock);
  }
}

function renderAcknowledgementContent(
  target: HTMLElement,
) {
  const acknowledgement =
    getRiskAcknowledgement(
      ACKNOWLEDGEMENT_VERSION,
      getUiLocale(),
    );

  target.replaceChildren();

  if (!acknowledgement) {
    console.error(
      `Mining Risk Acknowledgement ${ACKNOWLEDGEMENT_VERSION} is unavailable.`,
    );
    return;
  }

  for (const block of acknowledgement.blocks) {
    appendContentBlock(target, block);
  }
}

function refreshAcknowledgementText() {
  if (!overlay) {
    return;
  }

  const content =
    overlay.querySelector<HTMLElement>(
      ".risk-acknowledgement-content",
    );

  const kicker =
    overlay.querySelector<HTMLElement>(
      ".risk-acknowledgement-kicker",
    );

  const title =
    overlay.querySelector<HTMLElement>(
      "#risk-acknowledgement-title",
    );

  const version =
    overlay.querySelector<HTMLElement>(
      ".risk-acknowledgement-version",
    );

  const acceptanceText =
    overlay.querySelector<HTMLElement>(
      "#risk-acknowledgement-acceptance-text",
    );

  const exitButton =
    overlay.querySelector<HTMLButtonElement>(
      "#risk-acknowledgement-exit",
    );

  const continueButton =
    overlay.querySelector<HTMLButtonElement>(
      "#risk-acknowledgement-continue",
    );

  const closeButton =
    overlay.querySelector<HTMLButtonElement>(
      "#risk-acknowledgement-close",
    );

  if (kicker) {
    kicker.textContent =
      translate("riskAcknowledgement.kicker");
  }

  if (title) {
    title.textContent =
      translate("riskAcknowledgement.title");
  }

  if (version) {
    version.textContent =
      translate(
        "riskAcknowledgement.version",
        {
          version: ACKNOWLEDGEMENT_VERSION,
        },
      );
  }

  if (acceptanceText) {
    acceptanceText.textContent =
      translate("riskAcknowledgement.acceptance");
  }

  if (exitButton) {
    exitButton.textContent =
      translate("riskAcknowledgement.action.exit");
  }

  if (continueButton) {
    continueButton.textContent =
      translate(
        "riskAcknowledgement.action.acknowledgeAndContinue",
      );
  }

  if (closeButton) {
    closeButton.textContent =
      translate("riskAcknowledgement.action.close");
  }

  if (content) {
    renderAcknowledgementContent(content);
  }

  if (acknowledgementButton) {
    acknowledgementButton.textContent =
      translate("riskAcknowledgement.reviewLink");
    acknowledgementButton.title =
      translate("riskAcknowledgement.reviewTitle");
  }
}

function showAcknowledgement(firstRun: boolean) {
  if (!overlay) {
    return;
  }

  refreshAcknowledgementText();

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
        <div class="risk-acknowledgement-heading">
          <div class="risk-acknowledgement-kicker"></div>
          <h2 id="risk-acknowledgement-title"></h2>
          <div class="risk-acknowledgement-version"></div>
        </div>

        <div
          class="risk-acknowledgement-language"
          id="risk-acknowledgement-language"
        ></div>
      </header>

      <div class="risk-acknowledgement-content"></div>

      <footer class="risk-acknowledgement-footer">
        <div class="risk-acknowledgement-first-run-controls">
          <label class="risk-acknowledgement-check">
            <input
              id="risk-acknowledgement-checkbox"
              type="checkbox"
            />
            <span id="risk-acknowledgement-acceptance-text"></span>
          </label>

          <div class="risk-acknowledgement-actions">
            <button
              id="risk-acknowledgement-exit"
              class="risk-button risk-button-secondary"
              type="button"
            ></button>

            <button
              id="risk-acknowledgement-continue"
              class="risk-button risk-button-primary"
              type="button"
              disabled
            ></button>
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
          ></button>
        </div>
      </footer>
    </section>
  `;

  document.body.append(overlay);

  const languageHost =
    overlay.querySelector<HTMLDivElement>(
      "#risk-acknowledgement-language",
    );

  languageHost?.append(
    createLanguageSelector({
      className: "language-selector-risk",
      showLabel: true,
    }),
  );

  refreshAcknowledgementText();

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

  refreshAcknowledgementText();
}

function initializeRiskAcknowledgement() {
  buildAcknowledgementUi();

  onUiLanguageChanged(
    refreshAcknowledgementText,
  );
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
