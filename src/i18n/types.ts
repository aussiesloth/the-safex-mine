export type TextDirection = "ltr" | "rtl";

export interface LocaleMetadata {
  id: string;
  nativeName: string;
  direction: TextDirection;
  fallback: string | null;
  enabled: boolean;
  developerOnly?: boolean;
}

export type InterpolationValue = string | number;
export type InterpolationValues = Readonly<Record<string, InterpolationValue>>;
