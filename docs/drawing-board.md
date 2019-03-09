# Drawing Board

```
From the main app's menu...

 [File]__________
   | New Profile |
   | ...         |
   | Add Image   |___________
   | Import... > | Telegram  | --.
   |_____________| Matrix    |    \
                 | Others... |     |
                 |___________|     |
                                   |
                                  /
           .---------------------'
          / e.g. https://t.me/addstickers/SoatokDhole
    _____v_______________________________   /
   | Telegram Sticker Import Window   [x]| /
   |-------------------------------------|/
   |               ____________________  |
   | Sticker URL: (____________________) | ===> Fetch .PNGs
   |               ____________________  |   from microservice
   | Save to:     (~/stickers_|_Browse_) |          ||
   |                                     |          ||
   |                                     |          ||
   |          [Import]  [Cancel]         |          ||
   |_____________________________________|         ,||,
                                                   \  /
                                                    \/
                                                Add all to
                                             current profile.
```

* Grab from main process, notify renderer when fetching/saving is complete
* Two pieces of information from import window:
    1. The sticker pack URL
    2. The destination folder
* Pass all file paths to renderer process upon completion
