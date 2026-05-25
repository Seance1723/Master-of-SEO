import type { MediaAuditInput, MediaAuditOutput } from "../types/media.ts";
import { runMediaAudit } from "./media-audit.ts";

export function runVideoSeoAudit(input: MediaAuditInput): MediaAuditOutput {
  return runMediaAudit({ ...input, mode: "video", images: input.images ?? [] });
}
