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

function encodePath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

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

export async function listFiles(
  dirPath: string,
  cache: RequestCache = "no-store"
): Promise<string[]> {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encodePath(dirPath)}?ref=${BRANCH}`;
  const res = await fetch(url, { headers: headers(), cache });
  if (!res.ok) return [];
  const data = await res.json();
  if (!Array.isArray(data)) return [];

  const paths: string[] = [];
  for (const item of data) {
    if (item.type === "file" && item.name.endsWith(".md")) {
      paths.push(item.path);
    } else if (item.type === "dir") {
      const subPaths = await listFiles(item.path, cache);
      paths.push(...subPaths);
    }
  }
  return paths;
}

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
  return res.ok;
}
