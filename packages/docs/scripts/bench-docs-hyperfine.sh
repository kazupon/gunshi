#!/usr/bin/env bash
#
# Docs API generator benchmark — typedoc vs ox-content.
#
# packages/docs が持つ 2 系統の API リファレンス生成を比較する:
#   1. build:typedoc    — typedoc --excludeInternal            → src/api   (基準)
#   2. build:ox-content — node generate-api-with-ox-content.mjs → src/api-ox
#
# ../ox-jsdoc/tasks/benchmark/scripts/jsdoc-linter-hyperfine.sh を踏襲し、
# pnpm ラッパーを挟まずバイナリを直接起動して純粋なツール実行時間を測る。
#
# hyperfine の Relative 列は最速コマンドを基準(1.00)に固定する仕様で、
# --reference を渡しても export 表の正規化は変わらない。そこで raw な JSON を
# hyperfine に出力させ、bench-docs-report.mjs で build:typedoc を基準とした
# markdown を生成する(参考スイートの jsdoc-linter-report.mjs と同じ分業)。
#
# Usage:
#   bash packages/docs/scripts/bench-docs-hyperfine.sh
#   RUNS=5 WARMUP=2 bash packages/docs/scripts/bench-docs-hyperfine.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCS_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
RESULTS="$DOCS_ROOT/.bench"

WARMUP="${WARMUP:-1}"
RUNS="${RUNS:-10}"

# Sanity checks --------------------------------------------------------------
if ! command -v hyperfine >/dev/null 2>&1; then
  echo "error: hyperfine not found in PATH" >&2
  exit 1
fi
for bin in "$DOCS_ROOT/node_modules/.bin/typedoc"; do
  if [[ ! -x "$bin" ]]; then
    echo "error: missing binary: $bin (run 'pnpm install')" >&2
    exit 1
  fi
done

mkdir -p "$RESULTS"

# DOCS_ROOT へ移動して相対パスで短く実行する(per-command の cd ラッパー不要)。
cd "$DOCS_ROOT"

TYPEDOC_CMD="./node_modules/.bin/typedoc --excludeInternal"
APIOX_CMD="node ./scripts/generate-api-with-ox-content.mjs"

# Benchmark ------------------------------------------------------------------
# 基準(build:typedoc)を先に計測することで、api-ox が読む src/api を再生成しておく。
echo
echo "=== docs API generators: typedoc(基準) vs ox-content (warmup=$WARMUP runs=$RUNS) ==="
hyperfine \
  --warmup "$WARMUP" \
  --runs "$RUNS" \
  --ignore-failure \
  --command-name "build:typedoc" "$TYPEDOC_CMD" \
  --command-name "build:ox-content" "$APIOX_CMD" \
  --export-json "$RESULTS/docs-typedoc-vs-ox.json"

# Report (build:typedoc 基準の markdown レポートを生成) -----------------------
echo
echo "=== report (relative to build:typedoc) ==="
WARMUP="$WARMUP" RUNS="$RUNS" node "$SCRIPT_DIR/bench-docs-report.mjs"

echo
echo "Done. Results:"
echo "  $RESULTS/docs-typedoc-vs-ox.json   (raw hyperfine results)"
echo "  $RESULTS/docs-typedoc-vs-ox.md     (build:typedoc 基準のレポート)"
