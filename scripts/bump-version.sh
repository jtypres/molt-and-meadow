#!/bin/sh
# Run this before each push so phones load the new code instead of a cached copy.
# It stamps a new version number onto every script, stylesheet and import.
set -e
cd "$(dirname "$0")/.."
v=$(date +%Y%m%d%H%M)
sed -i '' -E "s#(\.js|\.css)\?v=[0-9]+#\1?v=$v#g" index.html js/*.js
echo "Version set to $v"
