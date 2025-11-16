# TOON Token Savings Front‑end

This directory contains a simple **React** application for exploring token savings afforded by the TOON format.  Non‑technical users can upload JSON files and instantly see the number of tokens consumed in both JSON and TOON representations.  Interactive charts help visualise the savings and compare them to the context windows of various language models.

## Getting started

1. **Install Node.js** (version 18 or newer) and npm.  On most systems you can run:

   ```bash
   node --version
   npm --version
   ```

2. **Install dependencies**.  In the `react-frontend/` directory run:

   ```bash
   npm install
   ```

   This installs React, Plotly, Axios and the `react-scripts` build tool.

   **Note on security vulnerabilities**: After installation, `npm audit` may report vulnerabilities in dev dependencies (jest, webpack-dev-server, etc.). These are known issues in `react-scripts@5.0.1` and are safe to ignore for development. **Do not run `npm audit fix --force`** as it will break the installation by downgrading `react-scripts` to an invalid version.

3. **Start the development server**:

   ```bash
   npm start
   ```

   The app will open in your browser at `http://localhost:3000`.  If the back‑end API is running on a different port or host, update the URL in `src/components/UploadForm.js`.

## Architecture

The front‑end is intentionally lightweight.  It consists of three main components:

* `UploadForm` – handles file selection and submission via Axios to the `/upload` endpoint of the FastAPI server.
* `ResultCharts` – renders bar and line charts using Plotly to illustrate token counts and savings.
* `ContextRadar` – displays a polar chart comparing the context windows of common open‑source and proprietary models.

When a user uploads a JSON file, the app sends the file to the back‑end, which returns both the TOON encoding and a token‑count comparison.  The `App` component stores this data in state and passes it to the chart components.  The TOON representation is displayed in a preformatted block for transparency.

## Running in production

For production deployments, build the static files and serve them via a web server (e.g. Nginx).  After installing dependencies, run:

```bash
npm run build
```

This generates a `build/` directory with minified JavaScript and HTML.  Configure your web server to serve the static files and proxy API requests to the FastAPI server.

## Customising models

The radar chart’s model list is defined in `src/components/ContextRadar.js`.  Feel free to modify this array to include additional models or update context windows as new versions are released.  For parity with the Python code, keep the values in sync with `src/models_info.py`.

## Contributing

Pull requests are welcome.  If you discover issues or have suggestions for improving the front‑end, please open an issue or submit a PR in the main project repository.