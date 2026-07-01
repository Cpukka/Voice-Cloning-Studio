#!/bin/bash

# Install dependencies
pip install -r requirements.txt

# Create necessary directories
mkdir -p models/voice_cloning models/tts storage

echo "Build completed!"