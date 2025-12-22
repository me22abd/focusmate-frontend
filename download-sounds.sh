#!/bin/bash
# Download free ambient sounds from Pixabay (royalty-free)

echo "🎵 Downloading ambient sounds for Focusmate..."

cd public/sounds || exit

# Rain Sound
echo "Downloading Rain..."
curl -L -o recommended/rain.mp3 "https://cdn.pixabay.com/download/audio/2022/03/10/audio_3c7dd8c2f9.mp3?filename=rain-and-thunder-16705.mp3"

# Ocean Waves
echo "Downloading Ocean..."
curl -L -o nature/ocean.mp3 "https://cdn.pixabay.com/download/audio/2022/06/07/audio_0c87f71166.mp3?filename=ocean-wave-sounds-for-sleeping-117271.mp3"

# Forest Ambience
echo "Downloading Forest..."
curl -L -o nature/forest.mp3 "https://cdn.pixabay.com/download/audio/2022/03/15/audio_2465a0d9c1.mp3?filename=forest-with-small-river-birds-and-nature-field-recording-6735.mp3"

# Café Ambience
echo "Downloading Café..."
curl -L -o recommended/cafe.mp3 "https://cdn.pixabay.com/download/audio/2022/03/24/audio_c5a25b4c3b.mp3?filename=people-talking-restaurant-or-cafe-ambience-7408.mp3"

# Fireplace
echo "Downloading Fireplace..."
curl -L -o recommended/fireplace.mp3 "https://cdn.pixabay.com/download/audio/2022/03/10/audio_d1718ab41b.mp3?filename=fireplace-sound-98195.mp3"

# White Noise
echo "Downloading White Noise..."
curl -L -o white-noise/white-noise.mp3 "https://cdn.pixabay.com/download/audio/2021/08/09/audio_0a0b239e80.mp3?filename=white-noise-10262.mp3"

# Pink Noise
echo "Downloading Pink Noise..."
curl -L -o white-noise/pink-noise.mp3 "https://cdn.pixabay.com/download/audio/2023/10/02/audio_c23ac1a1f5.mp3?filename=pink-noise-182125.mp3"

# Brown Noise
echo "Downloading Brown Noise..."
curl -L -o recommended/brown-noise.mp3 "https://cdn.pixabay.com/download/audio/2023/09/25/audio_e534992ba7.mp3?filename=brown-noise-180433.mp3"

# Lo-Fi Beats
echo "Downloading Lo-Fi..."
curl -L -o beats/lofi-1.mp3 "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3"

# Meditation
echo "Downloading Meditation..."
curl -L -o calm/meditation.mp3 "https://cdn.pixabay.com/download/audio/2022/03/15/audio_4dba52f6fc.mp3?filename=meditation-spiritual-healing-awakening-103566.mp3"

echo ""
echo "✅ Download complete!"
echo "🎧 You now have 10 real ambient sounds!"
echo ""
echo "Refresh your browser and click the play button on any sound card."








