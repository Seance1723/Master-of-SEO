import { runMediaAudit } from "./media-audit.js";
export function runVideoSeoAudit(input) {
    return runMediaAudit({ ...input, mode: "video", images: input.images ?? [] });
}
//# sourceMappingURL=video-seo.js.map