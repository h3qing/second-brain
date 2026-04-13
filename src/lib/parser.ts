import matter from "gray-matter";
import { getFileContent } from "./github";

export interface ReviewItem {
  path: string;
  sha: string;
  title: string;
  content: string;
  sourceHighlights: SourceHighlight[];
  relatedConcepts: string[];
  frontmatter: Record<string, unknown>;
  rawContent: string;
}

export interface SourceHighlight {
  ref: string;
  text: string;
  location: string;
}

export function parseFrontmatter(raw: string) {
  try {
    const { data, content } = matter(raw);
    return { frontmatter: data, content: content.trim() };
  } catch {
    // Malformed YAML frontmatter — return content as-is
    return { frontmatter: {} as Record<string, unknown>, content: raw.trim() };
  }
}

export function extractTitle(content: string, path: string): string {
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) return h1Match[1].trim();
  const filename = path.split("/").pop() || "";
  return filename.replace(/\.md$/, "");
}

function extractEmbedRefs(content: string): string[] {
  const regex = /!\[\[([^\]]+?)#\^(ref-\d+)\]\]/g;
  const refs: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    refs.push(`${match[1]}#^${match[2]}`);
  }
  return refs;
}

function extractRelatedConcepts(content: string): string[] {
  const conceptSection = content.match(
    /##\s*Related\s*Concepts?\s*\n([\s\S]*?)(?=\n##|\n$|$)/i
  );
  if (!conceptSection) return [];
  const links = conceptSection[1].match(/\[\[([^\]]+)\]\]/g) || [];
  return links.map((l) => l.replace(/\[\[|\]\]/g, ""));
}

export async function resolveHighlights(
  content: string
): Promise<SourceHighlight[]> {
  const embedRefs = extractEmbedRefs(content);
  if (embedRefs.length === 0) return [];

  const highlights: SourceHighlight[] = [];
  const sourceCache = new Map<string, string>();

  for (const ref of embedRefs) {
    const [sourceName, blockRef] = ref.split("#^");
    const sourcePath = `10 Notes/Kindle Notes/${sourceName}.md`;

    let sourceContent = sourceCache.get(sourcePath);
    if (sourceContent === undefined) {
      const file = await getFileContent(sourcePath);
      sourceContent = file?.content || "";
      sourceCache.set(sourcePath, sourceContent);
    }

    if (sourceContent) {
      const refId = `^${blockRef}`;
      const lines = sourceContent.split("\n");
      for (const line of lines) {
        if (line.includes(refId)) {
          const cleanLine = line.replace(/\s*\^ref-\d+\s*$/, "").trim();
          const locMatch = cleanLine.match(
            /—\s*location:\s*\[(\d+)\]\(.*?\)/
          );
          const text = cleanLine
            .replace(/—\s*location:\s*\[.*?\]\(.*?\)/, "")
            .trim();
          highlights.push({
            ref: blockRef,
            text,
            location: locMatch ? `loc: ${locMatch[1]}` : "",
          });
          break;
        }
      }
    }
  }

  return highlights;
}

export async function parseReviewItem(
  path: string,
  sha: string,
  rawContent: string
): Promise<ReviewItem> {
  const { frontmatter, content } = parseFrontmatter(rawContent);
  const title = extractTitle(content, path);
  const sourceHighlights = await resolveHighlights(content);
  const relatedConcepts = extractRelatedConcepts(content);

  return {
    path,
    sha,
    title,
    content,
    sourceHighlights,
    relatedConcepts,
    frontmatter,
    rawContent,
  };
}

export function updateReviewStatus(
  rawContent: string,
  status: "reviewed" | "contested",
  date: string
): string {
  const { data, content } = matter(rawContent);
  const updated = {
    ...data,
    review_status: status,
    reviewed_date: date,
  };
  return matter.stringify(content, updated);
}
