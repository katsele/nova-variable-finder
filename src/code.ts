/**
 * This plugin finds nodes using a specific Figma variable and allows selecting them.
 * The plugin provides a UI for searching and displaying results.
 */

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

import { findNodesUsingVariable, getNodePath, switchToNodePage } from "./utils/node-finder";
import { findDeletedVariables } from "./utils/deleted-variables-finder";

// This shows the HTML page in "ui.html".
figma.showUI(__html__, {
  width: 350,
  height: 500,
  title: "Nova Variable Finder",
  themeColors: true,
});

/**
 * Handles messages from the UI.
 * @param msg - The message object containing the type and data from the UI
 */
figma.ui.onmessage = async (msg) => {
  if (msg.type === "resize") {
    figma.ui.resize(msg.width, msg.height);
    return;
  }
  
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
  } else if (msg.type === "find-deleted-variables") {
    try {
      const { fileKey, accessToken } = msg;
      if (!fileKey) {
        throw new Error("File key is required");
      }
      const deletedVars = await findDeletedVariables(fileKey, accessToken);
      figma.ui.postMessage({
        type: "deletedVariablesResults",
        variables: deletedVars
      });
    } catch (error) {
      figma.ui.postMessage({
        type: "error",
        message: error instanceof Error ? error.message : "An error occurred while finding deleted variables"
      });
    }
  } else if (msg.type === "select") {
    const node = (await figma.getNodeByIdAsync(msg.id)) as SceneNode;
    if (node) {
      await switchToNodePage(node);
      figma.currentPage.selection = [node];
      figma.viewport.scrollAndZoomIntoView([node]);
    }
  }
};
