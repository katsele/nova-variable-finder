import * as React from "react";
import * as ReactDOM from "react-dom/client";
import "./css/ui.css";

import { Logo } from "./components";

function App() {
  const [searchValue, setSearchValue] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [results, setResults] = React.useState<{ nodes: Array<{ id: string; name: string }> } | null>(null);

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
    parent.postMessage(
      { pluginMessage: { type: "select", id: nodeId } },
      "*"
    );
  };

  return (
    <>
      <nav>
        <Logo />
      </nav>
      <main>
        <h1>Find nodes by variable id or name</h1>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="e.g. VariableID:1:335 or variable/name"
        />
        <button 
          onClick={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? "Searching..." : "Find Nodes"}
        </button>
        <div className="results-list">
          {isLoading && (
            <div className="loading-text">Searching for nodes...</div>
          )}
          {!isLoading && results && (
            <>
              {results.nodes.length === 0 ? (
                <div className="no-results">No nodes found using this variable</div>
              ) : (
                <>
                  <h2>We found {results.nodes.length} nodes using this variable</h2>
                  {results.nodes.map((node, index) => {
                    const nodeName = node.name.split(" > ").pop();
                    return (
                      <div
                        key={node.id}
                        className="result-item"
                        onClick={() => handleNodeClick(node.id)}
                      >
                        {index + 1}. Variable used in: {nodeName}
                      </div>
                    );
                  })}
                </>
              )}
            </>
          )}
        </div>
        <div className="footer">
          <p>
            Made with <span className="heart">❤️</span> by the{" "}
            <a href="https://nova.eliagroup.io">Nova Team</a>
          </p>
        </div>
      </main>
    </>
  );
}

const root = document.getElementById("react-page");
if (root) {
  ReactDOM.createRoot(root).render(<App />);
}