interface Variable {
  id: string;
  name: string;
  key: string;
  variableCollectionId: string;
  resolvedType: 'BOOLEAN' | 'FLOAT' | 'STRING' | 'COLOR';
  valuesByMode: Record<string, boolean | number | string | { r: number; g: number; b: number; a: number }>;
  remote: boolean;
  description: string;
  hiddenFromPublishing: boolean;
  deletedButReferenced?: boolean;
}

interface VariableCollection {
  id: string;
  name: string;
  key: string;
  modes: Array<{ modeId: string; name: string }>;
  defaultModeId: string;
  remote: boolean;
  hiddenFromPublishing: boolean;
  variableIds: string[];
}

interface FigmaVariablesResponse {
  status: number;
  error: boolean;
  meta: {
    variables: Record<string, Variable>;
    variableCollections: Record<string, VariableCollection>;
  };
}

export interface DeletedVariable {
  id: string;
  name: string;
  collectionName: string;
  collectionId: string;
}

export async function findDeletedVariables(fileId: string, accessToken: string): Promise<DeletedVariable[]> {
  try {
    const response = await fetch(
      `https://api.figma.com/v1/files/${fileId}/variables/local`,
      {
        headers: {
          'X-FIGMA-TOKEN': accessToken,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: FigmaVariablesResponse = await response.json();
    const deletedVariables: DeletedVariable[] = [];

    // Find all variables that are marked as deletedButReferenced
    Object.entries(data.meta.variables).forEach(([_variableId, variable]) => {
      if (variable.deletedButReferenced) {
        const collection = data.meta.variableCollections[variable.variableCollectionId];
        if (collection) {
          deletedVariables.push({
            id: variable.id,
            name: variable.name,
            collectionName: collection.name,
            collectionId: collection.id,
          });
        }
      }
    });

    return deletedVariables;
  } catch (error) {
    console.error('Error fetching deleted variables:', error);
    throw error;
  }
}
