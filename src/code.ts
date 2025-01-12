/**
 * This plugin finds nodes using a specific Figma variable and allows selecting them.
 * The plugin provides a UI for searching and displaying results.
 */

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

import { findNodesUsingVariable, getNodePath, switchToNodePage } from "./utils/utils";

// This shows the HTML page in "ui.html".
figma.showUI(__html__, {
  width: 350,
  height: 300,
  title: "Nova Variable Finder",
  themeColors: true,
});

/**
 * Handles messages from the UI.
 * @param msg - The message object containing the type and data from the UI
 */
figma.ui.onmessage = async (msg) => {
  figma.ui.resize(350, 500);
  if (msg.type === "find-variable-nodes") {
    const variable = msg.id;
    let variableID;
    if (variable.startsWith("VariableID:")) {
      variableID = variable;
    } else {
      const variables = await figma.variables.getLocalVariablesAsync();
      const findVariable = variables.find((v) => v.name === variable);
      if (!findVariable) {
        figma.ui.postMessage({
          type: "variableResults",
          nodes: [],
        });
        return;
      }
      variableID = findVariable.id;
    }
    const nodes = await findNodesUsingVariable(variableID);
    figma.ui.postMessage({
      type: "variableResults",
      nodes: nodes.map((node) => ({
        id: node.id,
        name: getNodePath(node),
      })),
    });
  } else if (msg.type === "select") {
    const node = (await figma.getNodeByIdAsync(msg.id)) as SceneNode;
    if (node) {
      await switchToNodePage(node);
      figma.currentPage.selection = [node];
      figma.viewport.scrollAndZoomIntoView([node]);
    }
  }
};
