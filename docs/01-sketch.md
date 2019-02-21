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

### Move Image

```
//  0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15 ]
  [ a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p ]

move(1, 14)
  [ a, c, d, e, f, g, h, i, j, k, l, m, n, o, b, p ]
  
  [ a ] = firstSlice
  [ c, d, e, f, g, h, i, j, k, l, m, n, o ] = secondSlice
  [ p ] = thirdSlice
  
move(13, 0)
  [ o, a, c, d, e, f, g, h, i, j, k, l, m, n, b, p ]



```
