#!/usr/bin/env bash
# Convert project images to WebP next to the originals. Idempotent: skips outputs that
# already exist and are newer than their source. Originals are left untouched so the
# <picture> fallback keeps working if WebP ever fails to load.
set -u
cd "$(dirname "$0")/.."

ASSETS=public/assets
QUALITY=82
MAX_W=1600

# Only convert the images actually referenced from projects.html (plus a few
# hover-preview assets from resume.html). Missing files are skipped silently.
IMAGES=(
  "accumimg.png" "img1.png" "img2.png" "img3.png" "accumsa.png"
  "IMG_4508.JPG" "IMG_4507.JPG" "IMG_4509.JPG"
  "Screenshot 2026-03-13 000052.png" "Screenshot 2026-03-13 000118.png"
  "Screenshot 2026-03-13 000132.png" "Screenshot 2026-03-13 000202.png"
  "Screenshot 2026-03-13 000143.png" "Screenshot 2026-03-13 000538.png"
  "IMG_0286.jpg" "Screenshot 2026-03-10 172428.png" "IMG_4613.jpeg"
  "wolfrom-cover.jpg" "wolfrom-internals.jpg" "wolfrom-stand.jpg" "wolfrom-bench.jpg"
  "wolfrom-spin-poster.jpg"
  "wolfrom-render-iso.jpg" "wolfrom-render-face.jpg" "wolfrom-render-section.jpg" "wolfrom-render-side.jpg"
  "newiamge.png" "dejavubot-removebg-preview.png" "intake.png" "gnag.png"
  "deja.png" "deja1.png" "Screenshot 2026-02-01 145613.png"
  "Deja_Vu_Bot_Assemble_Version_1_v4_v1112.png" "IMG_2714.png" "dejapp.png"
  "zenithnot-removebg-preview.png" "zenithbottt.png" "IMG_0537.png"
  "zensim.png" "zensim22.png"
  "homepageinve.png" "invends.png"
  "pearpage.png" "pearis.png" "pearrr.png" "pearvoluyn.png"
  "IMG_0297.png" "IMG_0313.png"
  "beas1.png" "beas2.png" "beas3.png" "beas4.png" "beas5.png"
  "haulrobot-removebg-preview.png" "IMG_7934.png" "IMG_9617.png"
  "View_recent_photos-removebg-preview.png"
)

converted=0; skipped=0; missing=0
for name in "${IMAGES[@]}"; do
  src="$ASSETS/$name"
  if [ ! -f "$src" ]; then
    missing=$((missing+1))
    continue
  fi
  # strip extension (case-insensitive) to build the .webp target
  base="${name%.*}"
  dst="$ASSETS/$base.webp"
  if [ -f "$dst" ] && [ "$dst" -nt "$src" ]; then
    skipped=$((skipped+1))
    continue
  fi
  ffmpeg -loglevel error -y -i "$src" \
    -vf "scale='min($MAX_W,iw)':-2" \
    -c:v libwebp -quality $QUALITY \
    "$dst"
  converted=$((converted+1))
  printf "  %-60s %s\n" "$name" "$(du -h "$dst" | cut -f1)"
done

echo
echo "webp: converted=$converted skipped=$skipped missing=$missing"

# 21MB GIF -> small MP4 loop. Yuv420p + even dimensions keep it web-playable.
GIF="$ASSETS/IMG_0691-ezgif.com-video-to-gif-converter.gif"
MP4="$ASSETS/IMG_0691-ezgif.com-video-to-gif-converter.mp4"
if [ -f "$GIF" ] && { [ ! -f "$MP4" ] || [ "$GIF" -nt "$MP4" ]; }; then
  ffmpeg -loglevel error -y -i "$GIF" \
    -movflags +faststart -pix_fmt yuv420p \
    -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" \
    -crf 28 "$MP4"
  echo "gif->mp4: $(du -h "$MP4" | cut -f1)"
fi

# Fresh poster = exact first frame of background video. Tiny JPEG so the page
# shows a meaningful image before the video has buffered.
VIDEO="$ASSETS/background-video.mp4"
POSTER="$ASSETS/video-poster.jpg"
if [ -f "$VIDEO" ] && { [ ! -f "$POSTER" ] || [ "$VIDEO" -nt "$POSTER" ]; }; then
  ffmpeg -loglevel error -y -ss 0 -i "$VIDEO" -frames:v 1 \
    -vf "scale='min(1920,iw)':-2" -q:v 5 "$POSTER"
  echo "poster: $(du -h "$POSTER" | cut -f1)"
fi
