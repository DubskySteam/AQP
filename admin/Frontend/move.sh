#!/bin/bash
targetDir="/path/to/your/target/directory"

# Create target directory if it doesn't exist
mkdir -p "$targetDir"

# Copy files and directories, excluding .sh and .bat files
rsync -av --exclude='*.sh' --exclude='*.bat' . "$targetDir"
