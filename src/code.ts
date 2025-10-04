/**
 * This plugin finds nodes using a specific Figma variable and allows selecting them.
 * The plugin provides a UI for searching and displaying results.
 */

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

import {
  findNodesUsingVariable,
  getNodePath,
  switchToNodePage,
} from "./utils/node-finder";
import { findDeletedVariables } from "./utils/deleted-variables-finder";

// This shows the HTML page in "ui.html".
figma.showUI(__html__, {
  width: 350,
  height: 500,
  title: "Nova Variable Finder",
  themeColors: true,
});

// Send stored token to UI on startup
(async () => {
  try {
    const storedToken = await figma.clientStorage.getAsync("figma-token");
    console.log("Plugin startup: token retrieved from storage:", !!storedToken);
    if (storedToken) {
      figma.ui.postMessage({
        type: "stored-token",
        token: storedToken,
      });
      console.log("Plugin startup: sent stored token to UI");
    }
  } catch (error) {
    console.error("Error retrieving stored token:", error);
  }
})();

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
    const results = await findNodesUsingVariable(variableID);

    // Group nodes by page name
    const nodesByPage: Record<string, Array<{ id: string; name: string }>> = {};

    for (const { node, pageName } of results) {
      if (!nodesByPage[pageName]) {
        nodesByPage[pageName] = [];
      }
      nodesByPage[pageName].push({
        id: node.id,
        name: getNodePath(node),
      });
    }

    figma.ui.postMessage({
      type: "variableResults",
      variableId: variable,
      nodesByPage: nodesByPage,
      // Keep backward compatibility with nodes array
      nodes: results.map(({ node }) => ({
        id: node.id,
        name: getNodePath(node),
      })),
    });
  } else if (msg.type === "find-deleted-variables") {
    try {
      const { fileKey, accessToken, rememberToken } = msg;
      if (!fileKey) {
        throw new Error("File key is required");
      }

      // Store token if rememberToken is true
      if (rememberToken && accessToken) {
        console.log(
          "Storing token in clientStorage, remember token is:",
          rememberToken
        );
        await figma.clientStorage.setAsync("figma-token", accessToken);
        console.log("Token stored successfully");
      }

      const deletedVars = await findDeletedVariables(fileKey, accessToken);
      figma.ui.postMessage({
        type: "deletedVariablesResults",
        variables: deletedVars,
      });
    } catch (error) {
      figma.ui.postMessage({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "An error occurred while finding deleted variables",
      });
    }
  } else if (msg.type === "select") {
    const node = (await figma.getNodeByIdAsync(msg.id)) as SceneNode;
    if (node) {
      await switchToNodePage(node);
      figma.currentPage.selection = [node];
      figma.viewport.scrollAndZoomIntoView([node]);
    }
  } else if (msg.type === "clear-token") {
    try {
      await figma.clientStorage.deleteAsync("figma-token");
      figma.ui.postMessage({
        type: "token-cleared",
      });
    } catch (error) {
      figma.ui.postMessage({
        type: "error",
        message: "Error clearing token from storage",
      });
    }
  } else if (msg.type === "get-stored-token") {
    console.log("Received request for stored token from UI");
    try {
      const storedToken = await figma.clientStorage.getAsync("figma-token");
      console.log("Token exists in storage:", !!storedToken);
      if (storedToken) {
        figma.ui.postMessage({
          type: "stored-token",
          token: storedToken,
        });
      }
    } catch (error) {
      console.error("Error retrieving stored token:", error);
    }
  } else if (msg.type === "detach-variable") {
    try {
      const node = await figma.getNodeByIdAsync(msg.id);
      if (!node) {
        throw new Error("Node not found");
      }

      // Cast to SceneNode which should have boundVariables property
      const sceneNode = node as SceneNode;

      // Get all bound variables on this node
      const boundVars = sceneNode.boundVariables;
      if (!boundVars || Object.keys(boundVars).length === 0) {
        figma.notify("No variables found on this node");
        return;
      }

      let hasDetachedVariables = false;

      // Handle direct property bindings (like width, height, opacity, etc.)
      for (const prop in boundVars) {
        // Skip complex properties that need special handling
        if (
          [
            "fills",
            "strokes",
            "effects",
            "layoutGrids",
            "rectangleCornerRadii",
          ].includes(prop)
        ) {
          continue;
        }

        try {
          // Simple properties can be unbound directly
          sceneNode.setBoundVariable(
            prop as VariableBindableNodeField | VariableBindableTextField,
            null
          );
          hasDetachedVariables = true;
          console.log(`Detached variable from ${prop}`);
        } catch (e) {
          console.warn(`Could not unbind variable from property ${prop}`, e);
        }
      }

      // Handle fills - special handling for paint properties
      if (
        boundVars.fills &&
        "fills" in sceneNode &&
        Array.isArray(sceneNode.fills)
      ) {
        try {
          // Create a copy of the fills
          const fillsCopy = [...sceneNode.fills];

          // If the node has fills with bound variables, remove the binding
          for (let i = 0; i < fillsCopy.length; i++) {
            if (fillsCopy[i].boundVariables) {
              // Create a new fill without boundVariables
              const newFill = { ...fillsCopy[i] };
              delete newFill.boundVariables;
              fillsCopy[i] = newFill;
            }
          }

          sceneNode.fills = fillsCopy;
          hasDetachedVariables = true;
          console.log("Detached variables from fills");
        } catch (e) {
          console.warn("Could not unbind variables from fills", e);
        }
      }

      // Handle strokes - similar to fills
      if (
        boundVars.strokes &&
        "strokes" in sceneNode &&
        Array.isArray(sceneNode.strokes)
      ) {
        try {
          // Create a copy of the strokes
          const strokesCopy = [...sceneNode.strokes];

          // If the node has strokes with bound variables, remove the binding
          for (let i = 0; i < strokesCopy.length; i++) {
            if (strokesCopy[i].boundVariables) {
              // Create a new stroke without boundVariables
              const newStroke = { ...strokesCopy[i] };
              delete newStroke.boundVariables;
              strokesCopy[i] = newStroke;
            }
          }

          sceneNode.strokes = strokesCopy;
          hasDetachedVariables = true;
          console.log("Detached variables from strokes");
        } catch (e) {
          console.warn("Could not unbind variables from strokes", e);
        }
      }

      // // Handle corner radius bindings
      // if (boundVars.rectangleCornerRadii && 'cornerRadius' in sceneNode) {
      //   try {
      //     // Reset to current numeric value without variable binding
      //     const currentRadius = sceneNode.cornerRadius;
      //     sceneNode.cornerRadius = currentRadius;
      //     hasDetachedVariables = true;
      //     console.log("Detached variables from corner radius");
      //   } catch (e) {
      //     console.warn("Could not unbind variables from corner radius", e);
      //   }
      // }

      // Handle effects
      if (
        boundVars.effects &&
        "effects" in sceneNode &&
        Array.isArray(sceneNode.effects)
      ) {
        try {
          // Create a copy of the effects
          const effectsCopy = [...sceneNode.effects];

          // If the node has effects with bound variables, remove the binding
          for (let i = 0; i < effectsCopy.length; i++) {
            if (effectsCopy[i].boundVariables) {
              // Create a new effect without boundVariables
              const newEffect = { ...effectsCopy[i] };
              delete newEffect.boundVariables;
              effectsCopy[i] = newEffect;
            }
          }

          sceneNode.effects = effectsCopy;
          hasDetachedVariables = true;
          console.log("Detached variables from effects");
        } catch (e) {
          console.warn("Could not unbind variables from effects", e);
        }
      }

      // Handle layout grids
      if (boundVars.layoutGrids && "layoutGrids" in sceneNode) {
        try {
          const frameNode = sceneNode as FrameNode;
          if (Array.isArray(frameNode.layoutGrids)) {
            // Create a copy of the layout grids
            const gridsCopy = [...frameNode.layoutGrids];

            // If the node has layout grids with bound variables, remove the binding
            for (let i = 0; i < gridsCopy.length; i++) {
              if (gridsCopy[i].boundVariables) {
                // Create a new grid without boundVariables
                const newGrid = { ...gridsCopy[i] };
                delete newGrid.boundVariables;
                gridsCopy[i] = newGrid;
              }
            }

            frameNode.layoutGrids = gridsCopy;
            hasDetachedVariables = true;
            console.log("Detached variables from layout grids");
          }
        } catch (e) {
          console.warn("Could not unbind variables from layout grids", e);
        }
      }

      // Special case for auto layout spacing
      if (boundVars.itemSpacing && "layoutMode" in sceneNode) {
        try {
          const frameNode = sceneNode as FrameNode;
          if (frameNode.layoutMode !== "NONE") {
            // Reset to current numeric value
            const currentSpacing = frameNode.itemSpacing;
            frameNode.itemSpacing = currentSpacing;
            hasDetachedVariables = true;
            console.log("Detached variables from item spacing");
          }
        } catch (e) {
          console.warn("Could not unbind variables from item spacing", e);
        }
      }

      if (hasDetachedVariables) {
        figma.notify("Variable detached successfully");
      } else {
        figma.notify("No detachable variables found");
      }

      // Refresh the node list by triggering a search for the same variable again
      figma.ui.postMessage({
        type: "variable-detached",
        nodeId: sceneNode.id,
      });
    } catch (error) {
      figma.notify(
        "Error detaching variable: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  }
};
