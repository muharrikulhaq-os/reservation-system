"use server";

import fs from "fs";
import path from "path";

export interface ReleaseNote {
  version: string;
  content: string;
  date: string;
}

export async function getReleaseNotes(): Promise<ReleaseNote[]> {
  const changelogDir = path.join(process.cwd(), "change_log");
  
  if (!fs.existsSync(changelogDir)) {
    return [];
  }

  const files = fs.readdirSync(changelogDir);
  const notes: ReleaseNote[] = [];

  for (const file of files) {
    if (file.endsWith(".md")) {
      const filePath = path.join(changelogDir, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const stat = fs.statSync(filePath);
      
      // Remove .md extension to get version
      const version = file.replace(".md", "");
      
      notes.push({
        version,
        content,
        date: stat.mtime.toISOString(),
      });
    }
  }

  // Sort by version descending (basic string reverse sort or date sort)
  // Since semantic versioning could be complex, sorting by modified time is usually safe for changelogs if they are created sequentially.
  notes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return notes;
}
