# Basic Idea (Sketch)

```
   ___________________________
  |                         |#|  --> file (symlink?)
  |  ######  ######  ###### |#|          |
  |  # ## #  # ## #  # ## # | |          v
  |  ######  ######  ###### | |      Streamlabs
  |  ######  ######  ###### | |         OBS
  |_________________________|_|          |
       ^       ^                         v
      /       /                  Twitch / YouTube
  foo.png    /                        stream
            /
         bar.gif
```

Electron.js

## Profile (a.k.a. Sticker Set)

* Append/reorder elements in the array of stickers
* Remove elements from an array
* Iterable for drawing the images to the screen
  * Templating?

### Research

* Multiple windows
* Communication between windows/etc.

### TODO 

* Blank default image
* iterates on all class="sticker"
  * Add a context menu to delete
  * Drag n' drop to rearrange
* Drag images directly into the app from e.g. Windows Explorer
* Detect unsaved changes, prompt before closing
