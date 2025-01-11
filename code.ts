// #region Plugin Setup and UI Initialization
/**
 * This plugin finds nodes using a specific Figma variable and allows selecting them.
 * The plugin provides a UI for searching and displaying results.
 */

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, {
  width: 350,
  height: 300,
  title: "Nova Variable Finder",
  themeColors: true,
});
// #endregion

// #region Message Handling
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
// #endregion

// #region Node Search Functions
/**
 * Finds all nodes in the document that use a specific variable.
 * @param variableId - The ID of the variable to search for
 * @returns Promise<SceneNode[]> Array of nodes using the variable
 */
async function findNodesUsingVariable(
  variableId: string
): Promise<SceneNode[]> {
  const results: SceneNode[] = [];

  /**
   * Checks if a node uses the specified variable
   * @param node - The node to check
   * @returns boolean indicating if the node uses the variable
   */
  const checkNode = (node: SceneNode) => {
    const boundVariables = node.boundVariables;
    if (boundVariables) {
      for (const key in boundVariables) {
        if (Object.prototype.hasOwnProperty.call(boundVariables, key)) {
          const value = (boundVariables as Record<string, unknown>)[key];
          if (typeof value === "object" && value !== null) {
            if ("id" in value && value.id === variableId) {
              return true;
            }
            if (Array.isArray(value)) {
              for (const binding of value) {
                if (binding && "id" in binding && binding.id === variableId) {
                  return true;
                }
              }
            }
          }
        }
      }
    }
    return false;
  };

  for (const page of figma.root.children) {
    await page.loadAsync();
    const pageNodes = page.findAllWithCriteria({
      types: [
        "FRAME",
        "GROUP",
        "COMPONENT",
        "INSTANCE",
        "RECTANGLE",
        "TEXT",
        "VECTOR",
        "ELLIPSE",
        "POLYGON",
        "STAR",
        "LINE",
        "STAMP",
        "STICKY",
        "SHAPE_WITH_TEXT",
        "CONNECTOR",
      ],
    });

    for (const node of pageNodes) {
      if (checkNode(node)) {
        results.push(node);
      }
    }
  }

  return results;
}
// #endregion

// #region Utility Functions
/**
 * Gets the full path of a node in the document hierarchy
 * @param node - The node to get the path for
 * @returns string representing the node's path
 */
function getNodePath(node: BaseNode): string {
  const path: string[] = [node.name];
  let parent = node.parent;

  while (parent && parent.type !== "DOCUMENT") {
    path.unshift(parent.name);
    parent = parent.parent;
  }

  return path.join(" > ");
}

/**
 * Switches to the page containing the specified node
 * @param node - The node to switch to
 */
async function switchToNodePage(node: SceneNode) {
  const page = getNodePage(node);
  if (page && page !== figma.currentPage) {
    await figma.setCurrentPageAsync(page);
  }
}

/**
 * Gets the page that contains the specified node
 * @param node - The node to find the page for
 * @returns PageNode | null The page containing the node, or null if not found
 */
function getNodePage(node: BaseNode): PageNode | null {
  let current: BaseNode | null = node;
  while (current && current.type !== "PAGE") {
    current = current.parent;
  }
  return current as PageNode | null;
}
// #endregion
