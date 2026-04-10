import './TabBar.css';

export default function TabBar({ tabs, activeTab, onTabChange }) {
  return (
    <div className="tab-bar" id="tab-bar">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`tab-bar-item ${activeTab === tab ? 'active' : ''}`}
          onClick={() => onTabChange(tab)}
          id={`tab-${tab.toLowerCase().replace(/\s/g, '-')}`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
