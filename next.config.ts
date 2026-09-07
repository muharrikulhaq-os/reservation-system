import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  // Deploy server is chronically low on free RAM (routinely <1.5GB of 8GB
  // free) - a normal build spawns several parallel compile/minify workers
  // that together exhaust it and get SIGABRT'd (exit 134) or hard-crash the
  // Rust allocator under Turbopack. cpus: 1 + workerThreads: false forces
  // single-threaded compilation, trading build time for staying inside the
  // available memory budget - same lever as GOFLAGS="-p=1" GOMAXPROCS=1 for
  // the Go backend on this same box.
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
  // tsc --noEmit already gates this in CI (the `typecheck` job the deploy
  // job depends on) - re-running type-checking again inside `next build` on
  // this memory-starved box is redundant and expensive, not a safety net.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
