#!/usr/bin/env bash
# Turns a raw Playwright screen capture (reels/raw/*.webm) into a vertical
# 1080x1920 MP4 sized for Reels/TikTok. Two internal ffmpeg passes:
#
#   1. speed-ramp: cut the source into segments at --fast-ranges (source-
#      timeline seconds), doubling playback speed (setpts=0.5*PTS) inside
#      each range and leaving everything else untouched, then concat them
#      back into one clip.
#   2. frame + captions: scale that clip into a 1080x1920 frame -- a
#      blurred, cropped copy of the same frame behind a sharp, aspect-
#      correct copy on top, so mismatched aspect ratios letterbox into a
#      blurred backdrop instead of plain black bars -- then (optionally)
#      overlay drawtext captions, faded in/out with alpha only.
#
# No audio track is read, generated, or bundled anywhere in this pipeline
# -- see reels/README.md for why that's deliberate.
#
# Usage:
#   scripts/build-reel.sh --input reels/raw/<run-id>.webm \
#     --scene-name share-card \
#     --fast-ranges "6.0-24.0" \
#     --captions-file reels/captions.example.txt
#
# All flags but --input are optional. Run with --help for the full list.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="${REPO_ROOT}/reels/output"
RAW_DIR="${REPO_ROOT}/reels/raw"

INPUT=""
SCENE_NAME="reel"
FAST_RANGES=""
CAPTIONS_FILE=""
FONT_PATH="${REEL_FONT_PATH:-/System/Library/Fonts/Supplemental/Georgia.ttf}"
TARGET_W=1080
TARGET_H=1920
FPS=30
BLUR_SIGMA=20

usage() {
  cat <<'EOF'
Usage: scripts/build-reel.sh [options]

  --input <file>          Source .webm from record-reel.js.
                           Defaults to the most recently modified file in
                           reels/raw/*.webm.
  --scene-name <name>     Used in the output filename:
                           reels/output/YYYY-MM-DD-<name>.mp4
                           (default: "reel")
  --fast-ranges <spec>    Comma-separated start-end pairs, in the SOURCE
                           video's own seconds (i.e. the manifest.json
                           record-reel.js wrote next to the input file),
                           to play at 2x speed. Ranges must be sorted and
                           non-overlapping. Example: "6.0-24.0,30.0-34.0"
                           Leave unset to keep the whole clip at 1x.
  --captions-file <file>  Optional. Each line: "start|end|text", in the
                           OUTPUT (post-speed-ramp) timeline's seconds.
                           See reels/captions.example.txt for the format.
  --font <file>           Font file for --captions-file's drawtext.
                           Defaults to $REEL_FONT_PATH, or macOS's own
                           Georgia.ttf (the app's own font-family-display
                           stack's first choice -- see reels/README.md
                           for why there's no bundled font file to point
                           at instead).
  -h, --help              Show this help.
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    --input) INPUT="$2"; shift 2 ;;
    --scene-name) SCENE_NAME="$2"; shift 2 ;;
    --fast-ranges) FAST_RANGES="$2"; shift 2 ;;
    --captions-file) CAPTIONS_FILE="$2"; shift 2 ;;
    --font) FONT_PATH="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage; exit 1 ;;
  esac
done

command -v ffmpeg >/dev/null 2>&1 || { echo "ffmpeg not found on PATH. Install it (e.g. brew install ffmpeg) and retry." >&2; exit 1; }
command -v ffprobe >/dev/null 2>&1 || { echo "ffprobe not found on PATH (ships with ffmpeg)." >&2; exit 1; }

if [ -z "$INPUT" ]; then
  # shellcheck disable=SC2012
  INPUT="$(ls -t "${RAW_DIR}"/*.webm 2>/dev/null | head -n1 || true)"
  [ -n "$INPUT" ] || { echo "No --input given and no reels/raw/*.webm found. Run 'npm run record-reel' first." >&2; exit 1; }
  echo "No --input given -- using most recent capture: ${INPUT}"
fi
[ -f "$INPUT" ] || { echo "Input file not found: ${INPUT}" >&2; exit 1; }

if [ -n "$CAPTIONS_FILE" ]; then
  [ -f "$CAPTIONS_FILE" ] || { echo "Captions file not found: ${CAPTIONS_FILE}" >&2; exit 1; }
  [ -f "$FONT_PATH" ] || { echo "Font file not found: ${FONT_PATH}. Pass --font or set REEL_FONT_PATH." >&2; exit 1; }
fi

mkdir -p "$OUTPUT_DIR"

DATE_STR="$(date +%Y-%m-%d)"
BASENAME="${DATE_STR}-${SCENE_NAME}"
OUT="${OUTPUT_DIR}/${BASENAME}.mp4"
SUFFIX=1
while [ -e "$OUT" ]; do
  SUFFIX=$((SUFFIX + 1))
  OUT="${OUTPUT_DIR}/${BASENAME}-${SUFFIX}.mp4"
done

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

DURATION="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$INPUT")"

# --- Stage 1: build the speed-ramp + concat filter --------------------
# Walk the timeline 0..DURATION, alternating "normal" segments with the
# --fast-ranges the caller supplied (assumed sorted, non-overlapping).
# Each segment becomes one trim+setpts branch; concat joins them in order.

declare -a FAST_START FAST_END
if [ -n "$FAST_RANGES" ]; then
  IFS=',' read -ra RANGE_PARTS <<< "$FAST_RANGES"
  for part in "${RANGE_PARTS[@]}"; do
    FAST_START+=("${part%-*}")
    FAST_END+=("${part#*-}")
  done
fi

FILTER=""
declare -a SEG_LABELS
CURSOR="0"
SEG_INDEX=0

add_segment() {
  local start="$1" end="$2" fast="$3"
  awk -v s="$start" -v e="$end" 'BEGIN { exit !(e > s) }' || return 0
  local label="v${SEG_INDEX}"
  local speed_filter=""
  [ "$fast" = "1" ] && speed_filter=",setpts=0.5*PTS"
  FILTER="${FILTER}[0:v]trim=start=${start}:end=${end},setpts=PTS-STARTPTS${speed_filter}[${label}];"
  SEG_LABELS+=("[${label}]")
  SEG_INDEX=$((SEG_INDEX + 1))
}

RANGE_COUNT=${#FAST_START[@]}
for ((i = 0; i < RANGE_COUNT; i++)); do
  add_segment "$CURSOR" "${FAST_START[$i]}" 0
  add_segment "${FAST_START[$i]}" "${FAST_END[$i]}" 1
  CURSOR="${FAST_END[$i]}"
done
add_segment "$CURSOR" "$DURATION" 0

if [ "$SEG_INDEX" -eq 0 ]; then
  echo "No segments produced (check --fast-ranges against the clip's duration: ${DURATION}s)." >&2
  exit 1
fi

CONCAT_INPUTS="$(IFS=''; echo "${SEG_LABELS[*]}")"
FILTER="${FILTER}${CONCAT_INPUTS}concat=n=${SEG_INDEX}:v=1:a=0[vout]"

RAMPED="${TMP_DIR}/ramped.mp4"
ffmpeg -y -loglevel error -i "$INPUT" -filter_complex "$FILTER" -map "[vout]" -r "$FPS" -an \
  -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p "$RAMPED"

RAMPED_DURATION="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$RAMPED")"
echo "Speed-ramped duration: ${RAMPED_DURATION}s (source was ${DURATION}s)"

# --- Stage 2: vertical frame (blurred-letterbox) + optional captions --

FRAME_FILTER="[0:v]scale=${TARGET_W}:${TARGET_H}:force_original_aspect_ratio=increase,crop=${TARGET_W}:${TARGET_H},gblur=sigma=${BLUR_SIGMA}[bg];[0:v]scale=${TARGET_W}:${TARGET_H}:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,format=yuv420p[framed]"

FULL_FILTER="$FRAME_FILTER"
FINAL_LABEL="framed"
CAPTION_FONTSIZE=48
# ~1080px wide at this font/serif face comfortably fits two lines of this
# length with margin; longer captions wrap to a second line rather than
# running off the frame edge (drawtext doesn't wrap on its own).
CAPTION_WRAP_CHARS=26

# Breaks $1 into <=2 lines at the space closest to its midpoint, joined by
# a literal newline -- drawtext renders an embedded newline in `text` as
# a real line break. Short captions pass through on one line unchanged.
wrap_caption() {
  awk -v max="$CAPTION_WRAP_CHARS" '
    { if (length($0) <= max) { print; exit }
      mid = length($0) / 2
      best = -1; bestDist = length($0)
      for (i = 1; i <= length($0); i++) {
        if (substr($0, i, 1) == " ") {
          dist = (i > mid) ? i - mid : mid - i
          if (dist < bestDist) { bestDist = dist; best = i }
        }
      }
      if (best < 0) { print; exit }
      print substr($0, 1, best - 1) "\n" substr($0, best + 1)
    }' <<< "$1"
}

if [ -n "$CAPTIONS_FILE" ]; then
  ESCAPED_FONT="$(printf '%s' "$FONT_PATH" | sed "s/:/\\\\:/g")"
  LINE_INDEX=0
  PREV_LABEL="framed"
  while IFS='|' read -r start end text; do
    [ -z "${start:-}" ] && continue
    case "$start" in \#*) continue ;; esac
    WRAPPED_TEXT="$(wrap_caption "$text")"
    ESCAPED_TEXT="$(printf '%s' "$WRAPPED_TEXT" | sed "s/\\\\/\\\\\\\\/g; s/:/\\\\:/g; s/'/’/g")"
    NEXT_LABEL="cap${LINE_INDEX}"
    FADE_MS="0.35"
    ALPHA_EXPR="if(lt(t,${start}+${FADE_MS}),(t-${start})/${FADE_MS},if(gt(t,${end}-${FADE_MS}),(${end}-t)/${FADE_MS},1))"
    FULL_FILTER="${FULL_FILTER};[${PREV_LABEL}]drawtext=fontfile='${ESCAPED_FONT}':text='${ESCAPED_TEXT}':fontcolor=white:fontsize=${CAPTION_FONTSIZE}:line_spacing=8:x=(w-text_w)/2:y=h*0.70:box=1:boxcolor=black@0.35:boxborderw=24:enable='between(t,${start},${end})':alpha='${ALPHA_EXPR}'[${NEXT_LABEL}]"
    PREV_LABEL="$NEXT_LABEL"
    LINE_INDEX=$((LINE_INDEX + 1))
  done < "$CAPTIONS_FILE"
  FINAL_LABEL="$PREV_LABEL"
fi

ffmpeg -y -loglevel error -i "$RAMPED" -filter_complex "$FULL_FILTER" -map "[${FINAL_LABEL}]" -r "$FPS" -an \
  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p "$OUT"

FINAL_DURATION="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT")"
echo ""
echo "Wrote ${OUT}"
printf 'Duration: %.1fs (target 15-25s)\n' "$FINAL_DURATION"
awk -v d="$FINAL_DURATION" 'BEGIN { if (d < 15 || d > 25) print "  note: outside the 15-25s target -- adjust --fast-ranges or trim the recorded scenes." }'
