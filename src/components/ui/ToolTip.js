import React, { useState } from 'react';

const styles = {
  tooltipContainer: {
    position: 'relative',
    display: 'inline-block',
  },
  tooltipText: (visible) => ({
    visibility: visible ? 'visible' : 'hidden',
    width: '250px',
    backgroundColor: '#1f2937',
    color: '#fff',
    textAlign: 'center',
    borderRadius: '6px',
    padding: '8px 12px',
    position: 'absolute',
    zIndex: 1,
    bottom: '125%',
    left: '50%',
    marginLeft: '-125px',
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.3s',
    fontSize: '0.875rem',
    lineHeight: '1.4',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  }),
  tooltipArrow: {
    content: '""',
    position: 'absolute',
    top: '100%',
    left: '50%',
    marginLeft: '-5px',
    borderWidth: '5px',
    borderStyle: 'solid',
    borderColor: '#1f2937 transparent transparent transparent',
  }
};

const Tooltip = ({ children, text }) => {
  const [visible, setVisible] = useState(false);

  if (!text) {
    return children;
  }

  return (
    <div
      style={styles.tooltipContainer}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      <div style={styles.tooltipText(visible)}>
        {text}
        <div style={styles.tooltipArrow}></div>
      </div>
    </div>
  );
};

export default Tooltip;