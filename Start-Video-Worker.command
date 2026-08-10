#!/bin/bash
echo "Starting Kolabriq Video Processing Worker..."
echo "Please keep this terminal window open to process videos!"
echo "--------------------------------------------------------"

# Go to the directory where this script is located
cd "$(dirname "$0")"

# Run the worker script
npx ts-node scripts/worker.ts

# Keep terminal open if it crashes
echo ""
echo "Worker stopped. Press any key to close this window..."
read -n 1 -s
