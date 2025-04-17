import React from 'react'

const SidebarButton = ({ className = '', expanded, onClick, children }) => {
  const childrenArray = React.Children.toArray(children);
  const [icon, label] = childrenArray;

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 p-4 transition-all duration-300 ${className}`}
    >
      <span className="text-2xl">{icon}</span>   
      <span
        className={`whitespace-nowrap overflow-hidden transition-all duration-300 
        ${expanded ? 'opacity-100 max-w-[200px] ml-2 scale-100' : 'opacity-0 max-w-0 scale-95 ml-0'}
        `}
      >
        {label}
      </span>
    </button>
  );
};

export default SidebarButton;