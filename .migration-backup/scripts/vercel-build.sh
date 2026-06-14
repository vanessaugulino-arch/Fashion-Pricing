#!/bin/sh
# vercel-build.sh — Builds the tfo-pricing SPA and wires up the
# Vercel Build Output API v3 so Vercel serves it as a static site
# regardless of monorepo detection.
set -e

echo "▶  Building tfo-pricing (prebuild regenerates benchmarks.json automatically)..."
pnpm --filter @workspace/tfo-pricing run build

echo "▶  Preparing .vercel/output/..."
mkdir -p .vercel/output/static
cp -r artifacts/tfo-pricing/dist/public/. .vercel/output/static/

echo "▶  Writing .vercel/output/config.json (SPA route config)..."
cat > .vercel/output/config.json << 'EOF'
{
  "version": 3,
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
EOF

echo "✅  Build Output API structure ready"
echo "    static files: $(ls .vercel/output/static | wc -l | tr -d ' ') entries"
