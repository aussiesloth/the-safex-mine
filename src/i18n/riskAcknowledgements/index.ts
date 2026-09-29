import enAuV1 from "./v1.0/en-AU.json";
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
    "en-AU": enAuV1 as RiskAcknowledgementDocument,
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
