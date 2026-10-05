import deV1 from "./v1.0/de.json";
import enAuV1 from "./v1.0/en-AU.json";
import enXaV1 from "./v1.0/en-XA.json";
import esV1 from "./v1.0/es.json";
import jaV1 from "./v1.0/ja.json";
import srCyrlV1 from "./v1.0/sr-Cyrl.json";
import srLatnV1 from "./v1.0/sr-Latn.json";
import zhHansV1 from "./v1.0/zh-Hans.json";
import type { RiskAcknowledgementDocument } from "./types";

export type {
  RiskAcknowledgementDocument,
  RiskContentBlock,
  RiskListBlock,
  RiskListItem,
  RiskParagraphBlock,
  RiskSectionBlock,
  RiskTextSegment,
} from "./types";

const riskAcknowledgements: Readonly<
  Record<string, Readonly<Record<string, RiskAcknowledgementDocument>>>
> = {
  "1.0": {
    de: deV1 as RiskAcknowledgementDocument,
    "en-AU": enAuV1 as RiskAcknowledgementDocument,
    "en-XA": enXaV1 as RiskAcknowledgementDocument,
    es: esV1 as RiskAcknowledgementDocument,
    ja: jaV1 as RiskAcknowledgementDocument,
    "sr-Cyrl": srCyrlV1 as RiskAcknowledgementDocument,
    "sr-Latn": srLatnV1 as RiskAcknowledgementDocument,
    "zh-Hans": zhHansV1 as RiskAcknowledgementDocument,
  },
};

export function getRiskAcknowledgement(
  acknowledgementVersion: string,
  localeId: string,
): RiskAcknowledgementDocument | null {
  const versionDocuments =
    riskAcknowledgements[acknowledgementVersion];

  if (!versionDocuments) {
    return null;
  }

  return (
    versionDocuments[localeId] ??
    versionDocuments["en-AU"] ??
    null
  );
}
