const REPO_OWNER = process.env.GITHUB_REPO_OWNER || "h3qing";
const REPO_NAME = process.env.GITHUB_REPO_NAME || "obsidian";
const BRANCH = "main";

function headers() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github.v3+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export interface RepoFile {
  path: string;
  sha: string;
  content: string;
}

export interface TreeEntry {
  path: string;
  sha: string;
  type: "blob" | "tree";
  size?: number;
}

function encodePath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

// --- Git Trees API (1 call = all files) ---

let treeCache: { entries: TreeEntry[]; fetchedAt: number } | null = null;
const TREE_CACHE_TTL = 30_000; // 30s in-memory cache

export async function getRepoTree(): Promise<TreeEntry[]> {
  const now = Date.now();
  if (treeCache && now - treeCache.fetchedAt < TREE_CACHE_TTL) {
    return treeCache.entries;
  }

  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/${BRANCH}?recursive=1`;
  const res = await fetch(url, { headers: headers(), cache: "no-store" });
  if (!res.ok) return treeCache?.entries || [];

  const data = await res.json();
  const entries: TreeEntry[] = (data.tree || [])
    .filter((item: { type: string }) => item.type === "blob")
    .map((item: { path: string; sha: string; type: string; size?: number }) => ({
      path: item.path,
      sha: item.sha,
      type: item.type,
      size: item.size,
    }));

  treeCache = { entries, fetchedAt: now };
  return entries;
}

// List files in a directory using the tree (no recursive API calls)
export async function listFiles(
  dirPath: string,
  cache: RequestCache = "no-store"
): Promise<string[]> {
  // Use tree API for fast listing
  const tree = await getRepoTree();
  const prefix = dirPath.endsWith("/") ? dirPath : dirPath + "/";
  return tree
    .filter((e) => e.path.startsWith(prefix) && e.path.endsWith(".md"))
    .map((e) => e.path);
}

// --- Content fetching ---

export async function getFileContent(
  path: string,
  cache: RequestCache = "no-store"
): Promise<RepoFile | null> {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encodePath(path)}?ref=${BRANCH}`;
  const res = await fetch(url, { headers: headers(), cache });
  if (!res.ok) return null;
  const data = await res.json();
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return { path: data.path, sha: data.sha, content };
}

// Fetch multiple files in parallel (batched to avoid rate limits)
const PARALLEL_BATCH_SIZE = 20;

export async function getFilesContent(
  paths: string[],
  cache: RequestCache = "no-store"
): Promise<Map<string, RepoFile>> {
  const results = new Map<string, RepoFile>();

  for (let i = 0; i < paths.length; i += PARALLEL_BATCH_SIZE) {
    const batch = paths.slice(i, i + PARALLEL_BATCH_SIZE);
    const files = await Promise.all(
      batch.map((path) => getFileContent(path, cache))
    );
    for (const file of files) {
      if (file) results.set(file.path, file);
    }
  }

  return results;
}

// --- Write operations ---

export async function updateFile(
  path: string,
  newContent: string,
  sha: string,
  message: string
): Promise<boolean> {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encodePath(path)}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({
      message,
      content: Buffer.from(newContent).toString("base64"),
      sha,
      branch: BRANCH,
    }),
  });

  // Invalidate tree cache on write
  if (res.ok) treeCache = null;

  return res.ok;
}
