#!/bin/bash
# Download Premium Sound Pack for Focus Timer
# Run this script to download all sound files from Mixkit

echo "🎵 Downloading premium ambient sounds from Mixkit..."

cd "$(dirname "$0")/public/sounds"

# Create directories
mkdir -p nature water ambient focus beats meditation classical

# Download with proper headers
download_file() {
  local url=$1
  local output=$2
  echo "Downloading: $output"
  curl -L --user-agent "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" \
    --referer "https://mixkit.co" \
    --fail --silent --show-error \
    "$url" -o "$output"
  
  # Check if file is valid MP3 (not an error page)
  if [ -f "$output" ]; then
    local size=$(stat -f%z "$output" 2>/dev/null || stat -c%s "$output" 2>/dev/null)
    if [ "$size" -lt 1000 ]; then
      echo "⚠️  Warning: $output appears to be too small (may be an error page)"
      echo "   File size: $size bytes"
      echo "   You may need to download manually from mixkit.co"
    else
      echo "✅ Downloaded: $output ($size bytes)"
    fi
  else
    echo "❌ Failed to download: $output"
  fi
}

# Nature
download_file "https://assets.mixkit.co/sfx/download/mixkit-light-rain-loop-2391.mp3" "nature/deep-rain.mp3"
download_file "https://assets.mixkit.co/sfx/download/mixkit-forest-stream-woosh-ambience-1223.mp3" "nature/forest-stream.mp3"

# Water
download_file "https://assets.mixkit.co/sfx/download/mixkit-small-ocean-waves-ambience-1207.mp3" "water/soft-waves.mp3"
download_file "https://assets.mixkit.co/sfx/download/mixkit-deep-sea-water-ambience-2743.mp3" "water/deep-ocean.mp3"

# Ambient
download_file "https://assets.mixkit.co/sfx/download/mixkit-coffee-shop-background-ambience-2840.mp3" "ambient/coffee-shop.mp3"
download_file "https://assets.mixkit.co/sfx/download/mixkit-city-traffic-ambience-2970.mp3" "ambient/soft-city-noise.mp3"

# Focus
download_file "https://assets.mixkit.co/sfx/download/mixkit-brown-noise-2553.mp3" "focus/brown-noise.mp3"
download_file "https://assets.mixkit.co/sfx/download/mixkit-soft-white-noise-2545.mp3" "focus/pink-noise.mp3"

# Beats
download_file "https://assets.mixkit.co/sfx/download/mixkit-lofi-chill-hip-hop-beat-438.mp3" "beats/lofi-study-beats.mp3"

# Meditation
download_file "https://assets.mixkit.co/sfx/download/mixkit-soft-synth-pad-455.mp3" "meditation/chill-synth-pad.mp3"
download_file "https://assets.mixkit.co/sfx/download/mixkit-soft-bell-tone-1092.mp3" "meditation/tibetan-bells.mp3"

# Classical
download_file "https://assets.mixkit.co/sfx/download/mixkit-soft-piano-melody-457.mp3" "classical/piano-study.mp3"

echo ""
echo "✅ Download script complete!"
echo "📁 Files should be in: public/sounds/"
echo ""
echo "⚠️  Note: If files are too small (< 1KB), they may be error pages."
echo "   Visit mixkit.co and download manually, then save to the paths in sounds.json"










