import * as React from "react";
import "./Footer.css";

export function Footer() {
  return (
    <footer>
      <p>
        Made with <span className="heart">❤️</span> by the{" "}
        <a onClick={()=> window.open("https://nova.eliagroup.io", "_blank")}>Nova Team</a>
      </p>
      <p>
        Need help?{" "}
        <a onClick={()=> window.open("https://github.com/katsele/nova-variable-finder?tab=readme-ov-file#nova-variable-finder", "_blank")}>
          Check the docs
        </a>
      </p>
    </footer>
  );
}
