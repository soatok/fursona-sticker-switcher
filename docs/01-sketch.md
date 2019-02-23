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

* Read JSON file for each profile (constructor?)
* Populate an array of objects for each sticker
* Append/reorder elements in the array of stickers
* Remove elements from an array
* Write to a JSON file
* Iterable for drawing the images to the screen
  * Templating?

### Research

* Multiple windows
* Communication between windows/etc.
