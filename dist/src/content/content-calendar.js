export function buildContentCalendar(pillars, supporting, refresh, pruning, capacity = 4) {
    const queue = [
        ...pillars.map((item) => calendar(item.title, "pillar", item.priority)),
        ...refresh.map((item) => calendar(`Refresh ${item.url}`, "refresh", item.priority)),
        ...supporting.map((item) => calendar(item.title, "supporting", item.priority)),
        ...pruning.map((item) => calendar(`Prune ${item.url}`, "pruning", item.priority))
    ].sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));
    return queue.slice(0, capacity * 3).map((item, index) => ({ ...item, window: index < capacity ? "30_days" : index < capacity * 2 ? "60_days" : "90_days" }));
}
function calendar(title, type, priority) {
    return { window: "30_days", title, type, priority, owner: "unassigned", status: "planned" };
}
function priorityRank(priority) {
    return { P0: 0, P1: 1, P2: 2, P3: 3 }[priority];
}
//# sourceMappingURL=content-calendar.js.map