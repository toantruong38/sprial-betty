import React from "react";

class Workspace extends React.PureComponent {
  render() {
    const { children, length, editing, hidden } = this.props;
    return (
      <div
        style={{
          backgroundColor: editing ? "transparent" : "#fff",
          margin: "auto",
          position: "relative",
          width: length,
          height: length,
          transition: ".2s",
          display: hidden ? "none" : "",
        }}
      >
        {children}
      </div>
    );
  }
}

export default Workspace;
