import type { Abi } from "viem";
import BasicArtifact from "../abi/TokenForgeBasic.json";
import BurnableArtifact from "../abi/TokenForgeBurnable.json";
import OwnableArtifact from "../abi/TokenForgeOwnable.json";
import GovernanceArtifact from "../abi/TokenForgeGovernance.json";

export type TemplateId = "basic" | "burnable" | "ownable" | "governance";

export type ExtraFieldType = "address" | "uint256";

export interface ExtraField {
  key: string;
  label: string;
  type: ExtraFieldType;
  hint?: string;
}

export interface TemplateSpec {
  id: TemplateId;
  name: string;
  description: string;
  features: string[];
  abi: Abi;
  bytecode: `0x${string}`;
  extraFields: ExtraField[];
}

export const TEMPLATES: TemplateSpec[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Fixed supply, immutable. Good for memecoins.",
    features: ["Fixed supply", "Immutable"],
    abi: BasicArtifact.abi as Abi,
    bytecode: BasicArtifact.bytecode as `0x${string}`,
    extraFields: [],
  },
  {
    id: "burnable",
    name: "Burnable",
    description: "Holders can burn their own tokens.",
    features: ["Fixed supply", "Holder burn"],
    abi: BurnableArtifact.abi as Abi,
    bytecode: BurnableArtifact.bytecode as `0x${string}`,
    extraFields: [],
  },
  {
    id: "ownable",
    name: "Ownable",
    description: "Owner can mint up to a cap, pause transfers, and burn.",
    features: ["Capped supply", "Owner mint / pause", "Holder burn"],
    abi: OwnableArtifact.abi as Abi,
    bytecode: OwnableArtifact.bytecode as `0x${string}`,
    extraFields: [
      {
        key: "owner",
        label: "Owner",
        type: "address",
        hint: "Defaults to your connected wallet.",
      },
      {
        key: "maxSupply",
        label: "Max Supply",
        type: "uint256",
        hint: "Hard cap. Must be ≥ initial supply.",
      },
    ],
  },
  {
    id: "governance",
    name: "Governance",
    description: "ERC-20 + EIP-2612 Permit + ERC20Votes for DAO use.",
    features: ["Fixed supply", "Permit", "Votes"],
    abi: GovernanceArtifact.abi as Abi,
    bytecode: GovernanceArtifact.bytecode as `0x${string}`,
    extraFields: [],
  },
];

export function getTemplate(id: TemplateId): TemplateSpec {
  const t = TEMPLATES.find((x) => x.id === id);
  if (!t) throw new Error(`Unknown template: ${id}`);
  return t;
}
