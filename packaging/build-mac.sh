#!/usr/bin/env bash
PREBUILT="https://github.com/electron/electron/releases/download/v4.1.1/electron-v4.1.1-darwin-x64.zip"
VERSION="v0.3.1"

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
cd ..
cd ../../..
zip "../fursona-sticker-switcher-${VERSION}-mac.zip" -r ./*
cd ..
rm -rf build-mac
