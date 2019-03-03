# Packaging New Releases

This requires GNU Parallel installed to work properly.

```terminal
./build.sh
```

This command will build the release files for each targeted
operating system, then sign each release file with GnuPG.

If you don't have GNU Parallel installed, don't want to sign
the releases, or only want to build for a specific platform,
feel free to use the respective `build-$PLATFORM.sh` file instead.
