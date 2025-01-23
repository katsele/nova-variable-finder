# Nova Variable Finder
![license](https://badgen.net/github/license/katsele/nova-variable-finder?color=orange) ![version](https://badgen.net/github/tag/katsele/nova-variable-finder?color=blue) ![stars](https://badgen.net/github/stars/katsele/nova-variable-finder?color=green) ![issues](https://badgen.net/github/open-issues/katsele/nova-variable-finder?color=red)

A Figma plugin that helps you find and locate nodes that use specific Figma variables in your document.

## Features

### Node Finder
- Search for nodes using a variable ID (e.g. `VariableID:1:335`)
- Search for nodes using a variable name
- Click on results to select and zoom to the node in your document
- Supports all types of variable bindings

### Deleted Variable Finder
Search for deleted variables in your document. Deleted variables are the variables that have been deleted from your variables collection but are referenced in somewhere in your document. 

> Note: This feature uses the Figma API to search for deleted variables. Unfortunately this API is only available for Entreprise tier client.

#### How to use
1. Open the plugin
2. Click on the "Deleted Variable Finder" tab
3. Provide the your file ID and your personal access token
4. Click on the "Search" button
5. The plugin will search for deleted variables in your document and display the results in the "Results" section
6. Click on a variable name to search for all the nodes that use this variable in your document
7. Click on a node to select and zoom to the node in your document

## Installation & Usage

To use this plugin, navigate to the [Plugin page](https://www.figma.com/community/plugin/1459614638693682410) in Figma and add or run “Nova Variable Finder” from your file. This will enable you to quickly search for variable bindings in your Figma document.

## Contributing

We welcome contributions of all kinds – from new features and bug fixes to documentation improvements.

- Development Setup (for local development):
  1. Clone this repository and open the folder in your editor.  
  2. Install dependencies:
    
      ```bash
      npm install
      ```
  3. Start the development server (watches for changes and automatically rebuilds the plugin):
    
      ```bash
      npm run watch
      ```  
  4. Make sure your changes work as expected in Figma by building and loading the plugin from the local manifest if needed.  

- We use [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) guidelines for commits to help with automated versioning and changelogs.  
- Use [issues](../../issues) to request features or report bugs.  
- Submit a pull request (PR) once your changes are ready.

Thank you for helping to make Nova Variable Finder better!
