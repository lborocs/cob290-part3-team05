import React from 'react'

const SidebarButton = ({ className = '', expanded, onClick, children }) => {
  const childrenArray = React.Children.toArray(children);
  const [icon, label] = childrenArray;

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 p-4 ${className}`}
    >
      {icon}
      <div
        className={`flex justify-between items-center whitespace-nowrap overflow-hidden transition-all duration-300
        ${expanded ? 'opacity-100 max-w-[200px] w-full ml-2' : 'opacity-0 max-w-0 w-0 ml-0'}
        `}
      >
        {label}
      </div>
    </button>
  );
};

export default SidebarButton;