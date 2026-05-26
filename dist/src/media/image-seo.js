import { runMediaAudit } from "./media-audit.js";
export function runImageSeoAudit(input) {
    return runMediaAudit({ ...input, mode: "image", videos: input.videos ?? [] });
}
//# sourceMappingURL=image-seo.js.map