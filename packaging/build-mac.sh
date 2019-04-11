#!/usr/bin/env bash
PREBUILT="https://github.com/electron/electron/releases/download/v4.1.4/electron-v4.1.4-darwin-x64.zip"
VERSION="v0.4.0"

mkdir build-mac
cd build-mac

wget -O prebuilt.zip "${PREBUILT}"
unzip prebuilt.zip
rm prebuilt.zip
cd Electron.app/Contents/Resources
git clone https://github.com/soatok/fursona-sticker-switcher app
cd app
# git tag -v $VERSION
npm install
rm -rf .git
# Precompile
cd node_modules/node-hid
node-pre-gyp install --target-platform=darwin
cd ../..
# Back to app dir
cd ..
cd ../../..
zip "../fursona-sticker-switcher-${VERSION}-mac.zip" -r ./*
cd ..
rm -rf build-mac
