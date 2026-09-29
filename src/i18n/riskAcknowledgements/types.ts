export interface RiskTextSegment {
  text: string;
  strong: boolean;
}

export interface RiskParagraphBlock {
  id: string;
  type: "paragraph";
  emphasis: boolean;
  segments: readonly RiskTextSegment[];
}

export interface RiskListItem {
  id: string;
  segments: readonly RiskTextSegment[];
}

export interface RiskListBlock {
  id: string;
  type: "list";
  items: readonly RiskListItem[];
}

export interface RiskSectionBlock {
  id: string;
  type: "section";
  heading: string;
  blocks: readonly RiskContentBlock[];
}

export type RiskContentBlock =
  | RiskParagraphBlock
  | RiskListBlock
  | RiskSectionBlock;

export interface RiskAcknowledgementDocument {
  schemaVersion: number;
  acknowledgementVersion: string;
  locale: string;
  blocks: readonly RiskContentBlock[];
}
