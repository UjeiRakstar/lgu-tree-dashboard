// src/components/MapDashboard.jsx
import { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function RecenterButton({ center, cinematicFlyby }) {
  const map = useMap();
  return (
    <button 
      onClick={() => {
        if (cinematicFlyby) {
          map.flyTo(center, 17, { duration: 1.5 }); // Smooth flight
        } else {
          map.setView(center, 17); // Instant snap
        }
      }}
      title="Return to LGU Center"
      style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 1000, backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '50%', width: '50px', height: '50px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', transition: 'transform 0.2s' }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      📍
    </button>
  );
}

// Custom Hazard Icon (!)
const hazardIcon = new L.divIcon({
  className: 'custom-hazard-marker',
  html: `<div style="background-color: #ef4444; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 18px; border: 2px solid white; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.6);">!</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14], 
  popupAnchor: [0, -14] 
});

export default function MapDashboard({ lspuCenter, filteredMapTrees, layerFilters, toggleFilter, deleteTree, arborists, assignTicket, allTrees, mapSettings }) {
  
  const [dispatchTree, setDispatchTree] = useState(null);

  // NEW: Determine which map layer to show based on the settings!
  let tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"; // Default Street
  if (mapSettings?.style === 'satellite') {
    tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  } else if (mapSettings?.style === 'topo') {
    tileUrl = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
  }

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px', position: 'relative' }}>
      <h2 style={{ color: '#333', fontSize: '1.2rem', margin: '0 0 15px 0' }}>Spatial Distribution & Dispatch</h2>
      
      {/* THE DISPATCH MODAL OVERLAY */}
      {dispatchTree && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000, backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', width: '400px', maxWidth: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>Dispatch Field Worker</h3>
            <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '0.9rem' }}>Assigning ticket for: <strong>{dispatchTree.species || 'Unknown Tree'}</strong></p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', marginBottom: '20px' }}>
              {arborists.map(arborist => {
                const workload = allTrees.filter(t => t.assigned_to === arborist.name).length;
                
                // NEW: Check if this specific arborist currently holds this ticket
                const isAssignedToThisArborist = dispatchTree.assigned_to === arborist.name;
                
                return (
                  <div key={arborist.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: isAssignedToThisArborist ? '#f0fdf4' : '#f8fafc' }}>
                    <div>
                      <span style={{ fontWeight: 'bold', display: 'block', color: '#334155' }}>👤 {arborist.name}</span>
                      <span style={{ fontSize: '0.8rem', color: workload > 3 ? '#ef4444' : '#16a34a', fontWeight: 'bold' }}>
                        {workload} Pending Task{workload !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    {/* NEW: Dynamic Button State (Assigned vs Dispatch) */}
                    <button 
                      onClick={() => {
                        if (!isAssignedToThisArborist) {
                          assignTicket(dispatchTree.id, arborist.name);
                          // Instantly update the modal UI to show the new assignee!
                          setDispatchTree({ ...dispatchTree, assigned_to: arborist.name });
                        }
                      }}
                      disabled={isAssignedToThisArborist}
                      style={{ 
                        backgroundColor: isAssignedToThisArborist ? '#16a34a' : '#3b82f6', 
                        color: 'white', 
                        border: 'none', 
                        padding: '8px 16px', 
                        borderRadius: '6px', 
                        cursor: isAssignedToThisArborist ? 'default' : 'pointer', 
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                      }}
                    >
                      {isAssignedToThisArborist ? '✓ Assigned' : 'Dispatch'}
                    </button>
                  </div>
                );
              })}
              {arborists.length === 0 && <p style={{ color: '#ef4444', fontSize: '0.9rem' }}>No arborists available. Add them in the Field Team tab.</p>}
            </div>
            
            {/* Changed "Cancel" to "Close" since we no longer auto-close the modal on dispatch */}
            <button onClick={() => setDispatchTree(null)} style={{ width: '100%', padding: '10px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              Close Window
            </button>
          </div>
        </div>
      )}

      <div style={{ position: 'relative', height: '55vh', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        
        <div style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 1000, backgroundColor: 'rgba(255, 255, 255, 0.35)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', padding: '15px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.4)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: '#1e293b', fontWeight: 'bold', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '5px' }}>Map Layers</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#15803d', fontWeight: '700' }}>
              <input type="checkbox" checked={layerFilters.showHealthy} onChange={() => toggleFilter('showHealthy')} style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
              🌳 Healthy & Tagged
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#b91c1c', fontWeight: '700' }}>
              <input type="checkbox" checked={layerFilters.showHazards} onChange={() => toggleFilter('showHazards')} style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
              ⚠️ Action Needed
            </label>
            <div style={{ height: '1px', backgroundColor: 'rgba(0,0,0,0.1)', margin: '4px 0' }}></div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#64748b', fontWeight: '700' }}>
              <input type="checkbox" checked={layerFilters.showUntagged} onChange={() => toggleFilter('showUntagged')} style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
              ⚪ Legacy (Untagged)
            </label>
          </div>
        </div>

        <MapContainer center={lspuCenter} zoom={17} style={{ height: '100%', width: '100%' }}>
          {/* UPDATED: Dynamic Tile Layer! */}
          <TileLayer url={tileUrl} />
          
          {/* UPDATED: Pass the animation setting to the button */}
          <RecenterButton center={lspuCenter} cinematicFlyby={mapSettings?.cinematicFlyby} />
          
          {filteredMapTrees.map((tree) => {
            if (!tree.latitude || !tree.longitude) return null;
            
            const isHazard = tree.isDecayed || tree.isLeaning || tree.hasPowerlineConflict || tree.isRootProblem;
            const isUntagged = tree.is_tagged === false;

            const PopupContent = () => (
              <Popup>
                <div style={{ minWidth: '180px' }}>
                  <div style={{ width: '100%', height: '120px', marginBottom: '10px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {tree.imageUrl ? (
                      <img src={tree.imageUrl} alt="Tree" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>No Photo Available</span>
                    )}
                  </div>
                  <strong style={{ fontSize: '1.1rem', color: '#333' }}>{tree.species || 'Unknown Species'}</strong> <br/>
                  <hr style={{ margin: '5px 0', border: 'none', borderTop: '1px solid #eee' }}/>
                  
                  {isUntagged && !isHazard && (
                    <span style={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.85rem' }}>⚪ Needs RFID Tagging</span>
                  )}
                  
                  {isHazard && (
                    <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 'bold', display: 'block', marginTop: '5px' }}>
                      {tree.isDecayed ? '• Decayed ' : ''}
                      {tree.isLeaning ? '• Leaning ' : ''}
                      {tree.hasPowerlineConflict ? '• Powerline ' : ''}
                      {tree.isRootProblem ? '• Root ' : ''}
                    </span>
                  )}
                  
                  <div style={{ marginTop: '12px', display: 'flex', gap: '5px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                    
                    {/* NEW: The Map Button itself changes based on Assignment! */}
                    <button 
                      onClick={() => setDispatchTree(tree)} 
                      style={{ 
                        flex: 1.5, 
                        backgroundColor: tree.assigned_to ? '#10b981' : '#3b82f6', 
                        color: 'white', 
                        border: 'none', 
                        padding: '6px', 
                        borderRadius: '4px', 
                        cursor: 'pointer', 
                        fontSize: '0.75rem', 
                        fontWeight: 'bold' 
                      }}
                    >
                      {tree.assigned_to ? `👷‍♂️ ${tree.assigned_to}` : '👷‍♂️ Assign'}
                    </button>

                    <button onClick={() => deleteTree(tree.id)} style={{ flex: 1, backgroundColor: '#b91c1c', color: 'white', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      🗑️ Delete
                    </button>
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

            if (isUntagged) {
              return (
                <CircleMarker 
                  key={tree.id} center={[tree.latitude, tree.longitude]} 
                  pathOptions={{ color: 'white', weight: 2, fillColor: '#94a3b8', fillOpacity: 0.9 }} 
                  radius={10}
                >
                  <PopupContent />
                </CircleMarker>
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
  );
}