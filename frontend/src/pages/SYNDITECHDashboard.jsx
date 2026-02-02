import React, { useState } from 'react';

const SYNDITECHDashboard = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [servicesDropdown, setServicesDropdown] = useState(false);
  const [toolsDropdown, setToolsDropdown] = useState(false);

  const services = [
    { icon: '📋', title: 'Task Tracker', desc: 'Manage tasks and projects efficiently' },
    { icon: '🎯', title: 'Lead Management System', desc: 'Track and convert leads effectively' },
    { icon: '📦', title: 'Inventory Management System', desc: 'Track stock levels and orders' },
    { icon: '👥', title: 'HRMS', desc: 'Complete HR management solution' },
    { icon: '💼', title: 'Account Management System', desc: 'Manage finances and accounts' },
    { icon: '📞', title: 'IVR Software', desc: 'Automated calling solutions' },
  ];

  const sidebarItems = [
    { icon: '📊', label: 'Dashboard' },
    { icon: '👥', label: 'Employees' },
    { icon: '🎯', label: 'Recruitment' },
    { icon: '📄', label: 'Documents' },
    { icon: '⚙️', label: 'Settings' },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      {/* Navigation Bar */}
      <nav className="bg-gray-800 border-b border-orange-500/30 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-8">
          <h1 className="text-white text-xl font-bold">SYNDITECH</h1>
          <ul className="flex space-x-6">
            <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">Home</a></li>
            <li
              className="relative"
              onMouseEnter={() => setServicesDropdown(true)}
              onMouseLeave={() => setServicesDropdown(false)}
            >
              <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">Services</a>
              {servicesDropdown && (
                <div className="absolute top-full left-0 bg-gray-800 border border-orange-500/30 rounded-lg shadow-lg py-2 w-80 z-50">
                  {services.map((service, index) => (
                    <div key={index} className="flex items-center px-4 py-3 hover:bg-orange-500/10 border-l-4 border-transparent hover:border-orange-500 transition-all">
                      <span className="text-2xl mr-3">{service.icon}</span>
                      <div>
                        <div className="text-white font-medium">{service.title}</div>
                        <div className="text-gray-400 text-sm">{service.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </li>
            <li
              className="relative"
              onMouseEnter={() => setToolsDropdown(true)}
              onMouseLeave={() => setToolsDropdown(false)}
            >
              <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">Tools</a>
              {toolsDropdown && (
                <div className="absolute top-full left-0 bg-gray-800 border border-orange-500/30 rounded-lg shadow-lg py-2 w-80 z-50">
                  {services.map((service, index) => (
                    <div key={index} className="flex items-center px-4 py-3 hover:bg-orange-500/10 border-l-4 border-transparent hover:border-orange-500 transition-all">
                      <span className="text-2xl mr-3">{service.icon}</span>
                      <div>
                        <div className="text-white font-medium">{service.title}</div>
                        <div className="text-gray-400 text-sm">{service.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </li>
            <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">About</a></li>
            <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">Careers</a></li>
            <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">Pricing</a></li>
          </ul>
        </div>
        <div className="flex items-center space-x-4">
          <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
            Contact Us
          </button>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="text-gray-300 hover:text-orange-400 transition-colors"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      <div className="flex">
        {/* HR Manager Sidebar */}
        <aside className="w-64 bg-gray-800 border-r border-orange-500/30 p-6">
          <h2 className="text-orange-400 font-bold mb-6">HR Manager</h2>
          <ul className="space-y-4">
            {sidebarItems.map((item, index) => (
              <li key={index}>
                <button className="flex items-center w-full text-left text-gray-300 hover:text-orange-400 hover:bg-orange-500/10 px-3 py-2 rounded-lg transition-all">
                  <span className="text-xl mr-3">{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl font-bold text-white mb-4">SYNDITECH</h1>
            <h2 className="text-2xl text-orange-400 mb-6">Building Tomorrow's Technology, Today</h2>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              SYNDITECH is a leading provider of innovative software solutions designed to streamline business operations and enhance productivity. Our comprehensive suite of tools empowers organizations to manage HR, inventory, accounts, and more with unparalleled efficiency.
            </p>
            <div className="flex justify-center space-x-6">
              <button className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition-all transform hover:scale-105">
                Start Your Project
              </button>
              <button className="border border-orange-500 text-orange-400 px-8 py-3 rounded-lg hover:bg-orange-500 hover:text-white transition-all transform hover:scale-105">
                Free Trial
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SYNDITECHDashboard;