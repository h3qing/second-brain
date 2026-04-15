import { NextResponse } from "next/server";
import { listFiles, getFileContent } from "@/lib/github";
import { parseFrontmatter } from "@/lib/parser";

export async function GET() {
  const results: Record<string, unknown> = {};

  try {
    // Test 1: Can we list 20 Ideas?
    const ideaPaths = await listFiles("20 Ideas");
    results.ideaPathCount = ideaPaths.length;
    results.ideaPathSample = ideaPaths.slice(0, 5);

    // Test 2: Can we list 30 Concept?
    const conceptPaths = await listFiles("30 Concept");
    results.conceptPathCount = conceptPaths.length;
    results.conceptPathSample = conceptPaths.slice(0, 5);

    // Test 3: Can we read a specific file?
    if (ideaPaths.length > 0) {
      const file = await getFileContent(ideaPaths[0]);
      results.sampleFileFound = !!file;
      if (file) {
        const { frontmatter } = parseFrontmatter(file.content);
        results.sampleFrontmatter = frontmatter;
      }
    }

    // Test 4: Count unreviewed
    let unreviewed = 0;
    for (const path of ideaPaths) {
      const file = await getFileContent(path);
      if (!file) continue;
      const { frontmatter } = parseFrontmatter(file.content);
      if (frontmatter.review_status === "unreviewed") unreviewed++;
    }
    results.unreviewedCount = unreviewed;

    // Test 5: Env vars present?
    results.hasToken = !!process.env.GITHUB_TOKEN;
    results.tokenPrefix = process.env.GITHUB_TOKEN?.slice(0, 8) + "...";
    results.repoOwner = process.env.GITHUB_REPO_OWNER;
    results.repoName = process.env.GITHUB_REPO_NAME;

  } catch (err: unknown) {
    results.error = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json(results);
}
