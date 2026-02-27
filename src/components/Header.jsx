
import { supabase } from '../supabaseClient';// src/components/Header.jsx


export default function Header({ activeTab, setActiveTab, criticalCount }) {
  return (
    <div style={{ backgroundColor: '#16a34a', color: 'white', padding: '20px 40px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>Tree Inventory & Carbon Dashboard</h1>
          <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>Decision Support System v1.2</p>
        </div>
        <div style={{ fontSize: '0.9rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '5px 15px', borderRadius: '20px' }}>
          🟢 Live Sync Active
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '15px' }}>
        <button 
          onClick={() => setActiveTab('dashboard')}
          style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: activeTab === 'dashboard' ? 'white' : 'transparent', color: activeTab === 'dashboard' ? '#16a34a' : 'white', transition: 'all 0.2s' }}
        >
          📊 Main Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('actionBoard')}
          style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: activeTab === 'actionBoard' ? 'white' : 'transparent', color: activeTab === 'actionBoard' ? '#ef4444' : 'white', transition: 'all 0.2s' }}
        >
          ⚠️ Action Board ({criticalCount})
        </button>

        {/* NEW: The Logout Button */}
        <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.3)', margin: '0 5px' }}></div>
        
        <button 
          onClick={() => supabase.auth.signOut()}
          style={{ padding: '8px 16px', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: 'transparent', color: 'white', transition: 'all 0.2s' }}
        >
          🚪 Logout
        </button>

        {/* NEW: The Manage Arborists Button */}
        <button 
          onClick={() => setActiveTab('arborists')}
          style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: activeTab === 'arborists' ? 'white' : 'transparent', color: activeTab === 'arborists' ? '#3b82f6' : 'white', transition: 'all 0.2s' }}
        >
          👥 Field Team
        </button>
        
        <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.3)', margin: '0 5px' }}></div>      </div>
      
    </div>
  );
}