# BI Webapp

Angular frontend consuming the analytics endpoints exposed by the [BI Service](https://github.com/BFH-data-driven-waste-management/bi-service).

---
## Repository Structure

- `/public` - static assets.
- `/src` - application source.
  - `/app` - application code.
    - `bin` - bin-related views (`bin-details`, `bin-list`, `bin-map`) with shared `bin.model.ts` and `bin.service.ts`.
    - `dashboard` - dashboard view, model, service, and chart options.
    - `tour` - tour-related views (`tour-details`, `tour-overview`) with shared `tour.model.ts`, `tour.service.ts`, and `tour.presentation.ts`.
    - `shared` - cross-cutting components, services, models, constants, and chart utilities.
    - `app.config.ts`, `app.routes.ts`, `app.ts`, `app.html`, `app.css` - root application providers, routing, and shell component.
  - `/environments` - environment-specific configuration (backend base URL, Google Maps API key).
  - `index.html`, `main.ts`, `styles.css` - application entry and global styles.
- `angular.json` - Angular CLI workspace configuration.
- `package.json`, `package-lock.json` - npm project definition and lockfile.
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.spec.json` - TypeScript configuration (base, application build, tests).
- `.editorconfig`, `.prettierrc` - editor and formatter configuration.
- `.postcssrc.json` - PostCSS build configuration.

---
## Prerequisites

### Operating System
The implementation runs on Ubuntu and macOS.
The following versions are tested:
- Ubuntu 22.04.3 LTS (WSL2)
- macOS 26.4.1

### Software
- Node.js (^20.19.0 || ^22.12.0 || ^24.0.0)
- npm (bundled with Node.js)

### Backend
The webapp depends on a running instance of the [BI Service](https://github.com/BFH-data-driven-waste-management/bi-service), which exposes the analytics endpoints consumed by the webapp.
Set up and run the BI Service as instructed in its README before starting the webapp.

### Environment
A Google Maps API key (required for map views) must be set under `src/environments`.

---
## Environment setup

### 1. Install dependencies:
```bash
npm install
```
Expected result:
- A `node_modules` directory is created and `package-lock.json` is up to date.

---
## Usage

### Start the development server:
```bash
npm start
```
This invokes `ng serve` via the project's npm script, so no global Angular CLI installation is required.
Alternatively, run `npx ng serve` or, if the Angular CLI is installed globally, `ng serve` directly.

Expected result:
- The development server runs at `http://localhost:4200/` and reloads automatically on source changes.
- The webapp loads in the browser and renders data fetched from the BI Service (visible as populated dashboard, bin, and tour views).

---
## Additional information

- For Angular CLI commands and options, see the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli).

---
## Authors

- Affolter Marco, [marco.affolter2@students.bfh.ch](mailto:marco.affolter.2@students.bfh.ch)
- Scherer Janic, [janic.scherer@students.bfh.ch](mailto:janic.scherer@students.bfh.ch)
- Scherer Luca, [luca.scherer@students.bfh.ch](mailto:luca.scherer@students.bfh.ch)

---
## License

Copyright (c) 2026 Affolter Marco, Scherer Janic, Scherer Luca. All rights reserved.

This repository is made available for academic, educational, and research purposes only. Commercial use, redistribution, sublicensing, hosted use, or use in production systems requires prior written permission from the copyright holders. See the [LICENSE](./LICENSE) file for details.
