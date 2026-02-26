import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup } from 'react-leaflet';
import L from 'leaflet'; 
import { supabase } from './supabaseClient'; 
import 'leaflet/dist/leaflet.css';
import './App.css';

// Custom Hazard Icon (!)
const hazardIcon = new L.divIcon({
  className: 'custom-hazard-marker',
  html: `<div style="background-color: #ef4444; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 18px; border: 2px solid white; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.6);">!</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14], 
  popupAnchor: [0, -14] 
});

function App() {
  const lspuCenter = [14.262185, 121.397521];
  const [trees, setTrees] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [layerFilters, setLayerFilters] = useState({
    showHealthy: true,
    showHazards: true,
    mangoOnly: false 
  });

  useEffect(() => {
    fetchTrees();
  }, []);

  async function fetchTrees() {
    const { data, error } = await supabase.from('trees').select('*');
    if (!error) setTrees(data);
  }

  async function resolveTicket(id) {
    const confirmResolve = window.confirm("Mark this tree hazard as resolved and safe?");
    if (!confirmResolve) return;

    const { error } = await supabase
      .from('trees')
      .update({ isDecayed: false, isLeaning: false, hasPowerlineConflict: false, isRootProblem: false })
      .eq('id', id);

    if (!error) {
      fetchTrees(); 
      alert("Ticket Resolved! Map updated.");
    } else {
      alert("Error updating database.");
    }
  }

  // ==========================================
  // NEW: THE HARD DELETE FUNCTION (Admin Override)
  // ==========================================
  async function deleteTree(id) {
    const confirmDelete = window.confirm("WARNING: Are you sure you want to permanently delete this garbage data from the cloud?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from('trees')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchTrees(); 
      alert("Tree permanently deleted from the Cloud as the Single Source of Truth.");
    } else {
      console.error("Delete Error:", error);
      alert("Error deleting tree from database.");
    }
  }

  const toggleFilter = (filterName) => {
    setLayerFilters(prev => ({ ...prev, [filterName]: !prev[filterName] }));
  };

  const totalTrees = trees.length;
  const totalCarbon = trees.reduce((sum, tree) => sum + ((parseFloat(tree.dbh) || 0) * 1.5), 0).toFixed(2);
  const hazardTrees = trees.filter(tree => tree.isDecayed || tree.isLeaning || tree.hasPowerlineConflict || tree.isRootProblem);
  const criticalCount = hazardTrees.length;

  const filteredMapTrees = trees.filter(tree => {
    const isHazard = tree.isDecayed || tree.isLeaning || tree.hasPowerlineConflict || tree.isRootProblem;
    const isMango = tree.species && tree.species.toLowerCase().includes('mango');

    if (layerFilters.mangoOnly && !isMango) return false;
    if (layerFilters.showHealthy && !isHazard) return true;
    if (layerFilters.showHazards && isHazard) return true;
    return false;
  });

  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif', paddingBottom: '50px' }}>
      
      {/* Header */}
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
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
        
        {activeTab === 'dashboard' && (
          <>
            {/* Metrics */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
              <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderLeft: '5px solid #16a34a' }}>
                <p style={{ margin: 0, color: '#64748b', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase' }}>Total Trees Tagged</p>
                <h2 style={{ margin: '5px 0 0 0', fontSize: '2rem', color: '#1e293b' }}>{totalTrees}</h2>
              </div>
              <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderLeft: '5px solid #059669' }}>
                <p style={{ margin: 0, color: '#64748b', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase' }}>Est. Carbon</p>
                <h2 style={{ margin: '5px 0 0 0', fontSize: '2rem', color: '#1e293b' }}>{totalCarbon} <span style={{fontSize: '1rem', color: '#94a3b8'}}>kg</span></h2>
              </div>
              <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderLeft: '5px solid #ef4444' }}>
                <p style={{ margin: 0, color: '#64748b', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase' }}>Critical Hazards</p>
                <h2 style={{ margin: '5px 0 0 0', fontSize: '2rem', color: '#ef4444' }}>{criticalCount}</h2>
              </div>
            </div>

            {/* Map Container */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
              <h2 style={{ color: '#333', fontSize: '1.2rem', margin: '0 0 15px 0' }}>Spatial Distribution</h2>
              
              <div style={{ position: 'relative', height: '55vh', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                
                <div style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 1000, backgroundColor: 'rgba(255, 255, 255, 0.35)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', padding: '15px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.4)' }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: '#1e293b', fontWeight: 'bold', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '5px' }}>Map Layers</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#15803d', fontWeight: '700' }}>
                      <input type="checkbox" checked={layerFilters.showHealthy} onChange={() => toggleFilter('showHealthy')} style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
                      🌳 Healthy Trees
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#b91c1c', fontWeight: '700' }}>
                      <input type="checkbox" checked={layerFilters.showHazards} onChange={() => toggleFilter('showHazards')} style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
                      ⚠️ Action Needed
                    </label>
                    <div style={{ height: '1px', backgroundColor: 'rgba(0,0,0,0.1)', margin: '4px 0' }}></div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#d97706', fontWeight: '700' }}>
                      <input type="checkbox" checked={layerFilters.mangoOnly} onChange={() => toggleFilter('mangoOnly')} style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
                      🥭 Isolate Mango Trees
                    </label>
                  </div>
                </div>

                <MapContainer center={lspuCenter} zoom={17} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                  
                  {filteredMapTrees.map((tree) => {
                    if (!tree.latitude || !tree.longitude) return null;
                    const isHazard = tree.isDecayed || tree.isLeaning || tree.hasPowerlineConflict || tree.isRootProblem;
                    
                    const PopupContent = () => (
                      <Popup>
                        <div style={{ minWidth: '180px' }}>
                          <div style={{ width: '100%', height: '120px', marginBottom: '10px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {tree.imageUrl ? (
                              <img src={tree.imageUrl} alt="Tree" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>No Photo</span>
                            )}
                          </div>
                          <strong style={{ fontSize: '1.1rem', color: '#333' }}>{tree.species || 'Unknown'}</strong> <br/>
                          <hr style={{ margin: '5px 0', border: 'none', borderTop: '1px solid #eee' }}/>
                          <span style={{ color: '#555' }}><strong>DBH:</strong> {tree.dbh} cm</span> <br/>
                          <span style={{ color: '#555' }}><strong>Status:</strong> <span style={{ color: isHazard ? '#ef4444' : '#16a34a', fontWeight: 'bold' }}>{isHazard ? 'Action Needed' : 'Healthy'}</span></span> <br/>
                          <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 'bold', display: 'block', marginTop: '5px' }}>
                            {tree.isDecayed ? '• Decayed ' : ''}
                            {tree.isLeaning ? '• Leaning ' : ''}
                            {tree.hasPowerlineConflict ? '• Powerline ' : ''}
                            {tree.isRootProblem ? '• Root ' : ''}
                          </span>
                          
                          {/* NEW: Admin Actions directly inside the Map Popup! */}
                          <div style={{ marginTop: '12px', display: 'flex', gap: '5px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                            {isHazard && (
                              <button onClick={() => resolveTicket(tree.id)} style={{ flex: 1, backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>✓ Resolve</button>
                            )}
                            <button onClick={() => deleteTree(tree.id)} style={{ flex: 1, backgroundColor: '#b91c1c', color: 'white', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>🗑️ Delete</button>
                          </div>
                        </div>
                      </Popup>
                    );

                    if (isHazard) {
                      return (
                        <Marker key={tree.id} position={[tree.latitude, tree.longitude]} icon={hazardIcon}>
                          <PopupContent />
                        </Marker>
                      );
                    }

                    return (
                      <CircleMarker 
                        key={tree.id} center={[tree.latitude, tree.longitude]} 
                        pathOptions={{ color: 'white', weight: 2, fillColor: '#16a34a', fillOpacity: 0.9 }} 
                        radius={10}
                      >
                        <PopupContent />
                      </CircleMarker>
                    );
                  })}
                </MapContainer>
              </div>
            </div>
          </>
        )}

        {/* Action Board */}
        {activeTab === 'actionBoard' && (
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderTop: '5px solid #ef4444' }}>
            <h2 style={{ color: '#333', marginTop: 0, marginBottom: '20px', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>
              Pending Maintenance Tickets
            </h2>
            {hazardTrees.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#16a34a', fontSize: '1.2rem', fontWeight: 'bold', backgroundColor: '#dcfce7', borderRadius: '8px' }}>
                🎉 Zero Critical Hazards! The urban forest is safe.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#fee2e2', color: '#991b1b', borderBottom: '2px solid #fecaca' }}>
                      <th style={{ padding: '12px' }}>Species</th>
                      <th style={{ padding: '12px' }}>Coordinates</th>
                      <th style={{ padding: '12px' }}>Reported Hazards</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hazardTrees.map((tree) => (
                      <tr key={tree.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '15px', fontWeight: 'bold' }}>{tree.species || 'Unknown'}</td>
                        <td style={{ padding: '15px', color: '#64748b', fontSize: '0.9rem' }}>{tree.latitude.toFixed(5)}, {tree.longitude.toFixed(5)}</td>
                        <td style={{ padding: '15px', color: '#ef4444', fontWeight: 'bold' }}>
                          {tree.isDecayed ? 'Decayed ' : ''}
                          {tree.isLeaning ? 'Leaning ' : ''}
                          {tree.hasPowerlineConflict ? 'Powerline ' : ''}
                          {tree.isRootProblem ? 'Root ' : ''}
                        </td>
                        <td style={{ padding: '15px', textAlign: 'right' }}>
                          
                          {/* NEW: Side-by-Side Admin Buttons in the Table */}
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button 
                              onClick={() => resolveTicket(tree.id)}
                              style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                            >
                              ✓ Resolve
                            </button>
                            <button 
                              onClick={() => deleteTree(tree.id)}
                              style={{ backgroundColor: '#b91c1c', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                            >
                              🗑️ Delete
                            </button>
                          </div>

                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default App;