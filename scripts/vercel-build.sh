#!/bin/sh
set -e

echo "▶  Installing dependencies..."
pnpm install

echo "▶  Building tfo-pricing..."
pnpm --filter @workspace/tfo-pricing run build

echo "▶  Preparing Build Output API v3..."
OUT=artifacts/tfo-pricing/.vercel/output
mkdir -p "$OUT/static"
cp -r artifacts/tfo-pricing/dist/. "$OUT/static/"

cat > "$OUT/config.json" << 'EOF'
{"version":3,"routes":[{"handle":"filesystem"},{"src":"/(.*)","dest":"/index.html"}]}
EOF

echo "✅  Done: $(ls "$OUT/static" | wc -l | tr -d ' ') files ready"
