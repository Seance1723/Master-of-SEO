import type { MediaAuditInput, MediaAuditOutput } from "../types/media.ts";
import { runMediaAudit } from "./media-audit.ts";

export function runImageSeoAudit(input: MediaAuditInput): MediaAuditOutput {
  return runMediaAudit({ ...input, mode: "image", videos: input.videos ?? [] });
}
