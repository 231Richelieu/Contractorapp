# Construction App

A construction marketplace built with Expo, React Native, TypeScript, and Expo Router.

The app helps people discover construction contractors and browse property opportunities. The current prototype includes a home screen, contractor marketplace, property marketplace, search, category filters, and responsive web export.

## Current routes

- `/` — Construction App home screen
- `/contractors` — Contractor directory with search and specialty filters
- `/explore` — Property marketplace with search and property-type filters

## Technology

- Expo SDK 57
- React Native 0.86
- Expo Router
- TypeScript
- React 19
- React Native Web

## Run locally

Install dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npm run start
```

Run the web version:

```bash
npm run web
```

Export a static web build:

```bash
npx expo export --platform web
```

## Project structure

```text
src/
  app/
    _layout.tsx       # Expo Router stack
    index.tsx          # Home screen
    contractors.tsx   # Contractor marketplace
    explore.tsx       # Property marketplace
  types/
    marketplace.ts    # Shared contractor and property models
```

## Current status

The marketplace screens currently use local prototype data. Search, filtering, navigation, and static web export are working. Quote and inquiry buttons are currently UI placeholders and will be connected to persistent workflows in the next phase.

## Next milestones

1. Connect contractors and properties to persistent data.
2. Add contractor and property detail routes.
3. Replace alert-only actions with quote and inquiry forms.
4. Add authentication, listing management, and request history.
5. Add automated tests, linting, and production deployment configuration.
