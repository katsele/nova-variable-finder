/**
 * This module provides utilities for finding and navigating to nodes in the Figma document
 * that use specific variables. It includes functions for:
 * - Finding nodes that use a particular variable
 * - Getting the full path/name of a node
 * - Switching the viewport to focus on a specific node
 */

/**
 * Finds all nodes in the document that use a specific variable.
 * @param variableId - The ID of the variable to search for
 * @returns Promise<Array<{ node: SceneNode; pageName: string }>> Array of nodes with their page names
 */
export async function findNodesUsingVariable(
  variableId: string
): Promise<Array<{ node: SceneNode; pageName: string }>> {
  const results: Array<{ node: SceneNode; pageName: string }> = [];

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
        results.push({ node, pageName: page.name });
      }
    }
  }

  return results;
}

/**
 * Gets the full path of a node in the document hierarchy
 * @param node - The node to get the path for
 * @returns string representing the node's path
 */
export function getNodePath(node: BaseNode): string {
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
export async function switchToNodePage(node: SceneNode) {
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
