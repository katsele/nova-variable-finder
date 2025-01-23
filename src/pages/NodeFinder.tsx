import * as React from "react";
import { Loader } from "../components";
import { ResultList, ResultListItem } from "../components/ResultList/ResultList";

export default function NodeFinder() {
  const [searchValue, setSearchValue] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [results, setResults] = React.useState<{
    nodes: Array<{ id: string; name: string }>;
  } | null>(null);

  const handleSearch = () => {
    setIsLoading(true);
    parent.postMessage(
      { pluginMessage: { type: "find-variable-nodes", id: searchValue } },
      "*"
    );
  };

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data.pluginMessage;

      if (message.type === "variableResults") {
        setIsLoading(false);
        setResults(message);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleNodeClick = (nodeId: string) => {
    parent.postMessage({ pluginMessage: { type: "select", id: nodeId } }, "*");
  };

  return (
    <section>
      <h1>Find nodes by variable id or name</h1>
      <input
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="e.g. VariableID:1:335 or variable/name"
      />
      <button onClick={handleSearch} disabled={isLoading}>
        {isLoading ? "Searching..." : "Find Nodes"}
      </button>
      <div className="results">
        {isLoading && (
          <Loader label="Searching for nodes..." />
        )}
        {!isLoading && results && (
          <>
            {results.nodes.length === 0 ? (
              <div className="no-results">
                No nodes found using this variable
              </div>
            ) : (
              <>
                <h2>
                  We found {results.nodes.length} nodes using this variable
                </h2>
                <ResultList>
                  {results.nodes.map((node, index) => {
                    const nodeName = node.name.split(" > ").pop();
                    return (
                        <ResultListItem key={`node-${index}`} content={`Variable used in: ${nodeName}`} onClick={() => handleNodeClick(node.id)}/>
                    );
                  })}
                </ResultList>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
