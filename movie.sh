ffmpeg -pattern_type glob -r 2 -i 'images/munch/*.jpg' -r 30 movie.mp4
python spatial-media-2.0/spatialmedia -s none -i movie.mp4 munch.mp4