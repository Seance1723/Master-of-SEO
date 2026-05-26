export function planContentPruning(pages = []) {
    const items = [];
    for (const page of pages) {
        if (["duplicate", "thin", "outdated"].includes(page.status ?? "") && !page.traffic && !page.conversions)
            items.push({ url: page.url, reason: `Page status is ${page.status} with no provided traffic/conversions.`, priority: page.status === "duplicate" ? "P1" : "P2", action: page.status === "duplicate" ? "merge" : "improve" });
    }
    const map = new Map();
    for (const page of pages)
        if (page.targetKeyword)
            map.set(page.targetKeyword.toLowerCase(), [...(map.get(page.targetKeyword.toLowerCase()) ?? []), page.url]);
    for (const [keyword, urls] of map.entries())
        if (new Set(urls).size > 1)
            items.push({ url: [...new Set(urls)].join(", "), reason: `Multiple pages target ${keyword}.`, priority: "P1", action: "merge" });
    return items;
}
//# sourceMappingURL=content-pruning.js.map