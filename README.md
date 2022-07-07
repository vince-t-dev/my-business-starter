## Quick start

1. Install all dependencies with: `npm install`. Make sure your Node version is >= 16.14 and npm is >= 8.3.

2. Start the app in development mode by running: `npm start`.

3. http://localhost:3000 should launch on your browser. Changes will be instantly reflected when working in development mode and automatically compiled when building in the production environment.

4. When generating production files, change the `homepage` value from the `package.json` to directory that the app will be hosted on.


## Putting it on Expresia

1. Builds the app for production with `npm run build`.

2. register bash file `chmod +x ~/my-business-starter/build_xpr.sh` then run `./build_xpr.sh` (or do this manually by moving files in `build` folder to `/xpr/web/` folder).

3. *Temporary workaround until XPR supports rendering files with multiple dots* - Rename CSS/JS/SVG - remove all extra dots in filename and update index.hbs file if necessary.

4. Navigate to backend `GIT Bundles` and hit `Clone` on your bundle.


## Documentation

Visit https://www.expresia.com/resources/getting-started/development/my-business-integration/