# Fursona Sticker Switcher [![Support on Patreon](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Fshieldsio-patreon.herokuapp.com%2Fsoatok&style=flat)](https://patreon.com/soatok)

![App Screenshot](docs/img/fursona-stickers-01.png)

Small GUI application that swaps out images on the fly. 

Meant to be used with character stills or a personal Telegram sticker pack.

## Install Instructions

### Streamers

Go to the [Releases](https://github.com/soatok/twitch-fursona-stickers/releases)
page and download the latest release for your operating system.

Once you have the appropriate archive downloaded, extract it. 

### Developers

First, clone our repository using git. Then, run `npm install --save`.

## Using this App

### Windows

Extract the ZIP folder to a directory somewhere on your computer.

Run `electron.exe`.

For better performance, right click and select **Run as Administrator.**

### Linux

Extract the ZIP folder to a directory somewhere on your computer.

Run the `electron` binary.

### Mac OS X

Extract the ZIP folder to a directory somewhere on your computer.

Run `Electron.app`.

### Once The App is Running

![App Screenshot](docs/img/fursona-stickers-00.png)

At the top of your screen, you will see a textbox labelled "Image Source".
Copy and paste this into the file path for an Image Source in your streaming 
software.
 
You may edit this field if you have a specific file destination in mind.

Now go to File > Add Image to add your stickers. You may also drag and drop
images from Windows Explorer.

Once you click on the sticker, it should update in your streaming software.

To remove a sticker, right click and select "Remove Sticker".

To rearrange stickers, simply drag and drop them withing the application
window.

#### Telegram Sticker Pack Import

From your Telegram app, click the "Share" button for your desired
sticker pack. This will copy the URL to your clipboard.

In our app, go to File > Import > Telegram.

You may also change the destination directory that stickers will be
saved to from this window.

Paste the URL in the Sticker URL field in the window. Press Import.

## Caveats with Animated GIFs and Streamlabs OBS

If you append `.gif` to the Image Source file path, you can use GIFs (but
only GIFs) and they will animate. If you leave the image source without an
extension, it works with all image types, but GIFs will not be animated.

In the future, I'll devise a workaround (even if it means sending a pull
request to Streamlabs OBS) to make this usability wart go away.

## Verifying Releases

You can verify Soatok's PGP signature against this public key.

```
-----BEGIN PGP PUBLIC KEY BLOCK-----

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
MdnrI2XBOA7TtlSKViVsKc16/zhCIf8=
=a93P
-----END PGP PUBLIC KEY BLOCK-----
```
