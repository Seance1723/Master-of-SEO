import type { ContentCalendarItem, ContentItem, ContentPruningItem, ContentRefreshItem } from "../types/content.ts";

export function buildContentCalendar(pillars: ContentItem[], supporting: ContentItem[], refresh: ContentRefreshItem[], pruning: ContentPruningItem[], capacity = 4): ContentCalendarItem[] {
  const queue: ContentCalendarItem[] = [
    ...pillars.map((item) => calendar(item.title, "pillar", item.priority)),
    ...refresh.map((item) => calendar(`Refresh ${item.url}`, "refresh", item.priority)),
    ...supporting.map((item) => calendar(item.title, "supporting", item.priority)),
    ...pruning.map((item) => calendar(`Prune ${item.url}`, "pruning", item.priority))
  ].sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));
  return queue.slice(0, capacity * 3).map((item, index) => ({ ...item, window: index < capacity ? "30_days" : index < capacity * 2 ? "60_days" : "90_days" }));
}

function calendar(title: string, type: ContentCalendarItem["type"], priority: ContentCalendarItem["priority"]): ContentCalendarItem {
  return { window: "30_days", title, type, priority, owner: "unassigned", status: "planned" };
}

function priorityRank(priority: ContentCalendarItem["priority"]): number {
  return { P0: 0, P1: 1, P2: 2, P3: 3 }[priority];
}
