// client/src/components/BlockPanel.jsx

import React from "react";

const BlockPanel = () => {
  const handleDragStart = (event, type) => {
    event.dataTransfer.setData("type", type);
  };

  return (
    <div
      style={{
        width: "200px",
        background: "#1e1e2f",
        color: "white",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, "trigger")}
        style={blockStyle}
      >
        Trigger
      </div>

      <div
        draggable
        onDragStart={(e) => handleDragStart(e, "sentiment")}
        style={blockStyle}
      >
        Sentiment
      </div>

      <div
        draggable
        onDragStart={(e) => handleDragStart(e, "email")}
        style={blockStyle}
      >
        Email
      </div>
    </div>
  );
};

const blockStyle = {
  padding: "12px",
  background: "#2c2c44",
  borderRadius: "8px",
  cursor: "grab",
  textAlign: "center",
  userSelect: "none",
};



export default BlockPanel;