import React from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
}

const Header = ({ title, subtitle, rightElement }: HeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
        {subtitle && <p className="text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {rightElement && <div>{rightElement}</div>}
    </div>
  );
};

export default Header; 
 
 