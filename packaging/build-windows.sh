#!/usr/bin/env bash
PREBUILT="https://github.com/electron/electron/releases/download/v4.1.4/electron-v4.1.4-win32-x64.zip"
VERSION="v0.4.0"

mkdir build-win
cd build-win

wget -O prebuilt.zip "${PREBUILT}"
unzip prebuilt.zip
rm prebuilt.zip
cd resources
git clone https://github.com/soatok/fursona-sticker-switcher app
cd app
# git tag -v $VERSION
npm install
rm -rf .git
# Precompile
cd node_modules/node-hid
node-pre-gyp install --target-platform=win32
cd ../..
# Back to app dir
cd ..
cd ..
zip "../fursona-sticker-switcher-${VERSION}-win.zip" -r ./*
cd ..
rm -rf build-win
