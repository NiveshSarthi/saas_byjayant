import React, { createContext, useContext, useState } from 'react';
import Sidebar from './Sidebar';

const SidebarContext = createContext();

export const useSidebar = () => useContext(SidebarContext);

const Layout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        display: 'flex'
      }}>
        <Sidebar />
        <main style={{
          flex: 1,
          marginLeft: isCollapsed ? '4rem' : '16rem',
          transition: 'margin-left var(--transition-slow)',
          minHeight: '100vh'
        }}>
          <div className="animate-fade-in-up" style={{
            padding: '2rem',
            maxWidth: '1600px',
            margin: '0 auto'
          }}>
            {children}
          </div>
        </main>
      </div>
    </SidebarContext.Provider>
  );
};

export default Layout;