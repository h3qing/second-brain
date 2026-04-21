import { listCommits, type CommitSummary } from "./github";

export interface ReviewEvent {
  date: string; // YYYY-MM-DD (UTC)
  slug: string;
  action: "approve" | "contest" | "easy" | "medium" | "hard";
}

export interface HeatmapCell {
  date: string;
  count: number; // unique ideas reviewed that day
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ReviewStatsData {
  totalUnique: number;
  approves: number;
  contests: number;
  reviewsThisWeek: number;
  reviewsThisMonth: number;
  streak: { current: number; longest: number; lastDate: string | null };
  heatmap: { weeks: HeatmapCell[][]; start: string; end: string };
}

// Matches: review: approve "slug"  OR  review: easy "slug"
const REVIEW_RE =
  /^review:\s+(approve|contest|easy|medium|hard)\s+"([^"]+)"/i;

export function parseReviewEvents(commits: CommitSummary[]): ReviewEvent[] {
  const events: ReviewEvent[] = [];
  for (const c of commits) {
    const firstLine = c.message.split("\n", 1)[0];
    const m = firstLine.match(REVIEW_RE);
    if (!m) continue;
    events.push({
      date: c.date.slice(0, 10),
      slug: m[2],
      action: m[1].toLowerCase() as ReviewEvent["action"],
    });
  }
  return events;
}

function uniqueSlugsByDay(events: ReviewEvent[]): Map<string, Set<string>> {
  const byDay = new Map<string, Set<string>>();
  for (const e of events) {
    let set = byDay.get(e.date);
    if (!set) {
      set = new Set();
      byDay.set(e.date, set);
    }
    set.add(e.slug);
  }
  return byDay;
}

function addDays(iso: string, delta: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function computeStreak(byDay: Map<string, Set<string>>): {
  current: number;
  longest: number;
  lastDate: string | null;
} {
  const dates = [...byDay.keys()].sort();
  if (dates.length === 0) return { current: 0, longest: 0, lastDate: null };

  let longest = 1;
  let run = 1;
  for (let i = 1; i < dates.length; i++) {
    if (addDays(dates[i - 1], 1) === dates[i]) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  const today = todayUTC();
  const lastDate = dates[dates.length - 1];
  let current = 0;
  // Grace window: allow today to be empty (haven't reviewed yet today).
  if (lastDate === today || lastDate === addDays(today, -1)) {
    current = 1;
    for (let i = dates.length - 2; i >= 0; i--) {
      if (addDays(dates[i], 1) === dates[i + 1]) {
        current += 1;
      } else {
        break;
      }
    }
  }

  return { current, longest, lastDate };
}

function bucketLevel(count: number): HeatmapCell["level"] {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

// 52-week × 7-day grid ending today, Sunday-start columns, UTC.
function buildHeatmap(byDay: Map<string, Set<string>>): {
  weeks: HeatmapCell[][];
  start: string;
  end: string;
} {
  const end = todayUTC();
  const endDate = new Date(end + "T00:00:00Z");
  const endDow = endDate.getUTCDay(); // 0 = Sun
  const daysToSat = 6 - endDow;
  const gridEnd = new Date(endDate);
  gridEnd.setUTCDate(gridEnd.getUTCDate() + daysToSat);
  const gridStart = new Date(gridEnd);
  gridStart.setUTCDate(gridStart.getUTCDate() - (52 * 7 - 1));

  const weeks: HeatmapCell[][] = [];
  const cursor = new Date(gridStart);
  for (let w = 0; w < 52; w++) {
    const week: HeatmapCell[] = [];
    for (let d = 0; d < 7; d++) {
      const iso = cursor.toISOString().slice(0, 10);
      const isFuture = iso > end;
      const count = isFuture ? 0 : byDay.get(iso)?.size ?? 0;
      week.push({ date: iso, count, level: isFuture ? 0 : bucketLevel(count) });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    weeks.push(week);
  }

  return {
    weeks,
    start: gridStart.toISOString().slice(0, 10),
    end: gridEnd.toISOString().slice(0, 10),
  };
}

export async function getReviewStats(): Promise<ReviewStatsData> {
  const commits = await listCommits();
  const events = parseReviewEvents(commits);
  const byDay = uniqueSlugsByDay(events);

  const totalUnique = new Set(events.map((e) => e.slug)).size;
  const approves = events.filter((e) => e.action === "approve").length;
  const contests = events.filter((e) => e.action === "contest").length;

  const today = todayUTC();
  const weekAgo = addDays(today, -6);
  const monthAgo = addDays(today, -29);

  let reviewsThisWeek = 0;
  let reviewsThisMonth = 0;
  for (const [date, slugs] of byDay) {
    if (date >= weekAgo && date <= today) reviewsThisWeek += slugs.size;
    if (date >= monthAgo && date <= today) reviewsThisMonth += slugs.size;
  }

  return {
    totalUnique,
    approves,
    contests,
    reviewsThisWeek,
    reviewsThisMonth,
    streak: computeStreak(byDay),
    heatmap: buildHeatmap(byDay),
  };
}
