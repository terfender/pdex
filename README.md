# pdex

## Development

Run `pear run --dev .` to start the app

Run `pear stage dev` to stage the app (sync files from file system to P2P storage)

Run `pear seed dev` to seed the app (exposes the app to be run by pear run)

---

## Production

Run `pear stage production` to stage the app

Run `pear seed production` to seed the app

Run `pear run --checkout=staged <key>` to view the staged app (by default `--checkout=release` and will fallback to `staged` if not found)

Run `pear release production` to release the app
