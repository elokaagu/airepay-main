import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Lockfile in a parent folder (e.g. ~/package-lock.json) makes Next infer the wrong root; pin tracing to this repo.
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: projectRoot,
};

export default nextConfig;
