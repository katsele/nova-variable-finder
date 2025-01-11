# Variable Finder

A Figma plugin that helps you find and locate nodes that use specific Figma variables in your document.

## Features

- Search for nodes using a variable ID (e.g. `VariableID:1:335`)
- Search for nodes using a variable name
- Click on results to select and zoom to the node in your document
- Supports all types of variable bindings

## Development Setup

1. Clone this repository
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run watch
```

This will watch for file changes and automatically rebuild the plugin.

## Building

To create a production build:

```bash
npm run build
```

## Tech Stack

- TypeScript
- Figma Plugin API
- Webpack for bundling
