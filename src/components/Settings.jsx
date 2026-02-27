// src/components/Settings.jsx

export default function Settings({ mapSettings, setMapSettings }) {
  return (
    <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderTop: '5px solid #8b5cf6' }}>
      <h2 style={{ color: '#333', marginTop: 0, marginBottom: '20px', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>
        ⚙️ Command Center Configuration
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
        
        {/* Map Style Toggle */}
        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.05rem', color: '#1e293b' }}>🗺️ Default Map Layer</h3>
          <p style={{ margin: '0 0 15px 0', fontSize: '0.85rem', color: '#64748b' }}>Choose the base visual style for the spatial distribution map.</p>
          <select 
            value={mapSettings.style} 
            onChange={(e) => setMapSettings({...mapSettings, style: e.target.value})}
            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', cursor: 'pointer', backgroundColor: 'white' }}
          >
            <option value="street">Standard Street Map (Fastest)</option>
            <option value="satellite">Satellite Imagery (High Detail)</option>
            <option value="topo">Topographic Terrain (Elevation)</option>
          </select>
        </div>

        {/* Animation Toggle */}
        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.05rem', color: '#1e293b' }}>🎥 System Animations</h3>
          <p style={{ margin: '0 0 15px 0', fontSize: '0.85rem', color: '#64748b' }}>Enable or disable the cinematic camera sweeps when interacting with the map.</p>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '10px', backgroundColor: mapSettings.cinematicFlyby ? '#eff6ff' : 'white', borderRadius: '6px', border: mapSettings.cinematicFlyby ? '1px solid #bfdbfe' : '1px solid #cbd5e1', transition: 'all 0.2s' }}>
            <input 
              type="checkbox" 
              checked={mapSettings.cinematicFlyby} 
              onChange={(e) => setMapSettings({...mapSettings, cinematicFlyby: e.target.checked})}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '1rem', color: mapSettings.cinematicFlyby ? '#1d4ed8' : '#334155', fontWeight: mapSettings.cinematicFlyby ? 'bold' : 'normal' }}>
              {mapSettings.cinematicFlyby ? 'Cinematic Flyby Enabled' : 'Instant Snap (Disabled)'}
            </span>
          </label>
        </div>

      </div>
    </div>
  );
}