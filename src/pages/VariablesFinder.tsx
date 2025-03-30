import * as React from "react";
import { DeletedVariable } from "../utils/deleted-variables-finder";
import { Icon, ResultList, ResultListItem } from "../components";
import { Loader } from "../components/Loader/Loader";

interface NodeSearchResult {
  nodes: Array<{ id: string; name: string }>;
}

interface SearchFormProps {
  figmaToken: string;
  fileKey: string;
  isLoading: boolean;
  hasStoredToken: boolean;
  onTokenChange: (token: string) => void;
  onFileKeyChange: (key: string) => void;
  onRememberTokenChange: (remember: boolean) => void;
  onSearch: () => void;
  onClearToken: () => void;
}

const SearchForm: React.FC<SearchFormProps> = React.memo(
  ({
    figmaToken,
    fileKey,
    isLoading,
    hasStoredToken,
    onTokenChange,
    onFileKeyChange,
    onRememberTokenChange,
    onSearch,
    onClearToken,
  }) => (
    <div className="search-form">
      <input
        type="text"
        value={fileKey}
        onChange={(e) => onFileKeyChange(e.target.value)}
        placeholder="Enter the Figma file key"
      />
      <div className="token-input-container">
        <input
          type="password"
          value={figmaToken}
          onChange={(e) => onTokenChange(e.target.value)}
          placeholder="Enter your Figma access token"
          disabled={hasStoredToken}
        />
        {hasStoredToken && (
          <button className="clear-token-btn" onClick={onClearToken}>
            <Icon name="Trash" />
          </button>
        )}
      </div>
      {!hasStoredToken && (
        <div className="remember-token">
          <input 
            type="checkbox" 
          id="remember-token" 
          onChange={(e) => onRememberTokenChange(e.target.checked)}
          disabled={hasStoredToken}
        />
          <label htmlFor="remember-token">Remember token</label>
        </div>
      )}
      <button onClick={onSearch} disabled={isLoading}>
        {isLoading ? "Searching..." : "Find Deleted Variables"}
      </button>
    </div>
  )
);

interface VariableResultsProps {
  variable: DeletedVariable;
  isLoading: boolean;
  nodes: NodeSearchResult | undefined;
  onSearch: (id: string) => void;
  onNodeClick: (id: string) => void;
  onDetachVariable: (id: string) => void;
}

const VariableResults: React.FC<VariableResultsProps> = React.memo(
  ({ variable, isLoading, nodes, onSearch, onNodeClick, onDetachVariable }) => (
    <React.Fragment>
      <ResultListItem
        icon="Variable"
        content={variable.name}
        onClick={() => onSearch(variable.id)}
      />
      {isLoading && (
        <div className="node-results">
          <Loader label="Searching for nodes..." />
        </div>
      )}
      {nodes && (
        <>
          {nodes.nodes.length === 0 ? (
            <div className="no-results">No nodes found using this variable</div>
          ) : (
            <ResultList className="node-results-sublist">
              {nodes.nodes.map((node, nodeIndex) => (
                <>
                <ResultListItem
                  key={`${variable.id}-node-${nodeIndex}`}
                  content={node.name.split(" > ").pop() || node.name}
                  icon="Frame"
                  onClick={() => onNodeClick(node.id)}
                >
                  <Icon key={`${variable.id}-detach`} name="Detach" className="detach-variable" onClick={() => onDetachVariable(node.id)} />
                </ResultListItem>
                </>
              ))}
            </ResultList>
          )}
        </>
      )}
    </React.Fragment>
  )
);

export default function VariablesFinder() {
  const [figmaToken, setFigmaToken] = React.useState("");
  const [fileKey, setFileKey] = React.useState("");
  const [rememberToken, setRememberToken] = React.useState(false);
  const [hasStoredToken, setHasStoredToken] = React.useState(false);
  const [showAlert, setShowAlert] = React.useState(true);
  const [deletedVariables, setDeletedVariables] = React.useState<
    DeletedVariable[] | null
  >(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoadingDeleted, setIsLoadingDeleted] = React.useState(false);
  const [searchingVariableId, setSearchingVariableId] = React.useState<
    string | null
  >(null);
  const [nodeResults, setNodeResults] = React.useState<
    Record<string, NodeSearchResult>
  >({});
  const [isLoadingNodes, setIsLoadingNodes] = React.useState<
    Record<string, boolean>
  >({});

  const handleFindDeletedVariables = React.useCallback(() => {
    if (!figmaToken) {
      setError("Please enter a Figma access token");
      return;
    }
    if (!fileKey) {
      setError("Please enter a file key");
      return;
    }
    setError(null);
    setIsLoadingDeleted(true);
    setShowAlert(false);
    parent.postMessage(
      {
        pluginMessage: {
          type: "find-deleted-variables",
          accessToken: figmaToken,
          fileKey: fileKey,
          rememberToken: rememberToken,
        },
      },
      "*"
    );
  }, [figmaToken, fileKey, rememberToken]);

  const handleSearchNodes = React.useCallback((variableId: string) => {
    setSearchingVariableId(variableId);
    setIsLoadingNodes((prev) => ({ ...prev, [variableId]: true }));
    parent.postMessage(
      { pluginMessage: { type: "find-variable-nodes", id: variableId } },
      "*"
    );
  }, []);

  const handleNodeClick = React.useCallback((nodeId: string) => {
    parent.postMessage({ pluginMessage: { type: "select", id: nodeId } }, "*");
  }, []);
  
  const handleClearToken = React.useCallback(() => {
    parent.postMessage(
      { pluginMessage: { type: "clear-token" } },
      "*"
    );
  }, []);

  const handleDetachVariable = React.useCallback((nodeId: string) => {
    parent.postMessage(
      { pluginMessage: { type: "detach-variable", id: nodeId } },
      "*"
    );   
    
    // Find the variable ID by searching through node results
    const variableId = Object.keys(nodeResults).find(varId => 
      nodeResults[varId]?.nodes.some(node => node.id === nodeId)
    );
    
    // If found, update only that specific variable's nodes
    if (variableId) {
      setNodeResults(prev => ({
        ...prev,
        [variableId]: {
          ...prev[variableId],
          nodes: prev[variableId].nodes.filter(node => node.id !== nodeId)
        }
      }));
    }
  }, [nodeResults]);

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data.pluginMessage;
      if (message.type === "deletedVariablesResults") {
        setIsLoadingDeleted(false);
        setDeletedVariables(message.variables);
      } else if (message.type === "error") {
        setIsLoadingDeleted(false);
        setError(message.message);
      } else if (message.type === "variableResults") {
        const varId = message.variableId || searchingVariableId;
        if (varId) {
          setIsLoadingNodes((prev) => ({
            ...prev,
            [varId]: false,
          }));
          setNodeResults((prev) => ({
            ...prev,
            [varId]: message,
          }));
        }
      } else if (message.type === "stored-token") {
        console.log("UI received stored token from plugin");
        setFigmaToken(message.token);
        setHasStoredToken(true);
      } else if (message.type === "token-cleared") {
        console.log("UI received token cleared notification");
        setFigmaToken("");
        setHasStoredToken(false);
        setRememberToken(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [searchingVariableId, handleSearchNodes]);

  // Request token on mount
  React.useEffect(() => {
    console.log("Component mounted, requesting token status");
    parent.postMessage(
      { pluginMessage: { type: "get-stored-token" } },
      "*"
    );
  }, []);

  return (
    <section>
      {showAlert && !hasStoredToken && (
        <div className="alert-message">
          <h2>Before you begin</h2>
          <p>
            This feature uses the Figma Variables API, which is currently only
            accessible with the <strong>Enterprise plan</strong>.
          </p>
        </div>
      )}
      <h1>Find Deleted Variables</h1>
      <SearchForm
        figmaToken={figmaToken}
        fileKey={fileKey}
        isLoading={isLoadingDeleted}
        hasStoredToken={hasStoredToken}
        onTokenChange={setFigmaToken}
        onFileKeyChange={setFileKey}
        onRememberTokenChange={setRememberToken}
        onSearch={handleFindDeletedVariables}
        onClearToken={handleClearToken}
      />
      {error && <div className="error-message">{error}</div>}
      <div className="results">
        {isLoadingDeleted && (
          <Loader label="Searching for deleted variables..." />
        )}
        {!isLoadingDeleted && deletedVariables && (
          <>
            {deletedVariables.length === 0 ? (
              <div className="no-results">No deleted variables found</div>
            ) : (
              <>
                <h2>Found {deletedVariables.length} deleted variables</h2>
                <ResultList>
                  {deletedVariables.map((variable, index) => (
                    <VariableResults
                      key={`variable-group-${index}`}
                      variable={variable}
                      isLoading={isLoadingNodes[variable.id]}
                      nodes={nodeResults[variable.id]}
                      onSearch={handleSearchNodes}
                      onNodeClick={handleNodeClick}
                      onDetachVariable={handleDetachVariable}
                    />
                  ))}
                </ResultList>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
