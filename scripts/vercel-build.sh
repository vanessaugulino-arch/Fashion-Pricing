#!/bin/sh
# Builds the tfo-pricing SPA and wires up Vercel Build Output API v3
# so Vercel serves it as a static site regardless of monorepo detection.
set -e

echo "▶  Building tfo-pricing..."
pnpm --filter @workspace/tfo-pricing run build

echo "▶  Preparing .vercel/output/..."
mkdir -p .vercel/output/static
cp -r artifacts/tfo-pricing/dist/public/. .vercel/output/static/

echo "▶  Writing .vercel/output/config.json..."
cat > .vercel/output/config.json << 'EOF'
{
  "version": 3,
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
EOF

echo "✅  Build Output API v3 pronto"
echo "    arquivos estáticos: $(ls .vercel/output/static | wc -l | tr -d ' ') entradas"
