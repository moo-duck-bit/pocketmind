// GlobalStyles.js
import { Global } from "@emotion/react";
import React from "react";

const GlobalStyles = () => (
  <Global
    styles={`
      @media (min-width: 575px) {
        .desktop-view {
          display: block;
        }
        .smartphone-view {
          display: none;
        }
      }

      @media (max-width: 574px) {
        .desktop-view {
          display: none;
        }
        .smartphone-view {
          display: block;
        }
      }
    `}
  />
);

export default GlobalStyles;
