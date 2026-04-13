"use server";

import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import { getFileContent, updateFile } from "@/lib/github";
import { updateReviewStatus } from "@/lib/parser";

export async function reviewAction(formData: FormData) {
  const isLoggedIn = await verifySession();
  if (!isLoggedIn) redirect("/login");

  const path = formData.get("path") as string;
  const action = formData.get("action") as string;
  const returnTo = formData.get("returnTo") as string;

  if (!path || !action) redirect("/review");

  const file = await getFileContent(path);
  if (!file) redirect("/review");

  const today = new Date().toISOString().split("T")[0];

  let status: "reviewed" | "contested";
  if (action === "approve") {
    status = "reviewed";
  } else if (action === "contest") {
    status = "contested";
  } else {
    redirect(returnTo || "/review");
    return;
  }

  const updatedContent = updateReviewStatus(file.content, status, today);
  const slug = path.split("/").pop()?.replace(".md", "") || "unknown";
  const message = `review: ${action} "${slug}"`;

  const success = await updateFile(path, updatedContent, file.sha, message);

  if (!success) {
    // Retry once with fresh SHA
    const freshFile = await getFileContent(path);
    if (freshFile) {
      const freshContent = updateReviewStatus(freshFile.content, status, today);
      await updateFile(path, freshContent, freshFile.sha, message);
    }
  }

  redirect(returnTo || "/review");
}
