import {
  getLanguageOverride,
  supportedLocales,
  translate,
} from "./index";
import {
  onUiLanguageChanged,
  selectUiLanguage,
} from "./runtime";

const WINDOWS_LANGUAGE_VALUE = "__windows__";

export interface LanguageSelectorOptions {
  className?: string;
  showLabel?: boolean;
}

export function createLanguageSelector(
  options: LanguageSelectorOptions = {},
): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = [
    "language-selector",
    options.className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const label = document.createElement("label");
  label.className = options.showLabel
    ? "language-selector-label"
    : "language-selector-label language-selector-label-visually-hidden";

  const select = document.createElement("select");
  select.className = "language-selector-select";

  const windowsOption = document.createElement("option");
  windowsOption.value = WINDOWS_LANGUAGE_VALUE;
  select.append(windowsOption);

  for (const locale of supportedLocales) {
    if (!locale.enabled) {
      continue;
    }

    const option = document.createElement("option");
    option.value = locale.id;
    option.textContent = locale.nativeName;
    select.append(option);
  }

  label.append(select);
  wrapper.append(label);

  const refresh = () => {
    const labelText = translate("language.selector.label");

    label.setAttribute("aria-label", labelText);
    select.setAttribute("aria-label", labelText);
    windowsOption.textContent =
      translate("language.selector.useWindows");

    select.value =
      getLanguageOverride() ??
      WINDOWS_LANGUAGE_VALUE;
  };

  select.addEventListener("change", () => {
    const requestedLocale =
      select.value === WINDOWS_LANGUAGE_VALUE
        ? null
        : select.value;

    if (selectUiLanguage(requestedLocale) === null) {
      refresh();
    }
  });

  onUiLanguageChanged(refresh);
  refresh();

  return wrapper;
}
