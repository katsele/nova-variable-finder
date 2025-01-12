# Nova Variable Finder

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
npm run dev
```

This will bundle all plugin code into the dist folder, optimized for production.

## Building

To create a production build:

```bash
npm run build
```

## Tech Stack

- TypeScript
- React (for the UI)
- Figma Plugin API
- Webpack for bundling

## Contributing

We use [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) guidelines for commits. This helps with automated versioning and changelogs. Here’s how you can contribute:

1. Fork the repository and make your changes in a new branch.
2. Use [issues](https://github.com/katsele/nova-variable-finder/issues) to request features or report bugs.
3. Validate your changes locally.
4. Submit a pull request (PR) once your changes are ready.

We welcome contributions of all kinds – from new features and bug fixes to documentation improvements.

Thank you for helping to make Nova Variable Finder better!
