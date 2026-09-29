export function getRegionalFormattingLocale(): string | undefined {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale;
  return locale || undefined;
}

export function formatRegionalNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
  locale: string | undefined = getRegionalFormattingLocale(),
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatRegionalDate(
  value: Date | number,
  options?: Intl.DateTimeFormatOptions,
  locale: string | undefined = getRegionalFormattingLocale(),
): string {
  return new Intl.DateTimeFormat(locale, options).format(value);
}
