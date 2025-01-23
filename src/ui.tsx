import * as React from "react";
import * as ReactDOM from "react-dom/client";
import "./css/ui.css";

import { IconSprite, Logo, TabNav } from "./components";
import VariablesFinder from "./pages/VariablesFinder";
import NodeFinder from "./pages/NodeFinder";
import { Footer } from "./components/Footer/Footer";

const TABS = [
  { id: 'nodes', label: 'Find Nodes' },
  { id: 'variables', label: 'Find Deleted Variables' },
];

function App() {
  const [activeTab, setActiveTab] = React.useState<'nodes' | 'variables'>('nodes');

  return (
    <>
      <div className="app-container">
      <IconSprite />
      <nav>
        <Logo />
      </nav>
      <TabNav 
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as 'nodes' | 'variables')}
      />
      <hr />
      <main>
        {activeTab === 'nodes' ? <NodeFinder /> : <VariablesFinder />}
      </main>
      <Footer />
      </div>
    </>
  );
}

const root = document.getElementById("react-page");
if (root) {
  ReactDOM.createRoot(root).render(<App />);
}