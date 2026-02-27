// src/components/ActionBoard.jsx

export default function ActionBoard({ hazardTrees, resolveTicket, deleteTree, arborists, assignTicket }) {
  return (
    <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderTop: '5px solid #ef4444' }}>
      <h2 style={{ color: '#333', marginTop: 0, marginBottom: '20px', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>
        🚨 Pending Maintenance & Dispatch
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
                <th style={{ padding: '12px' }}>👷‍♂️ Dispatch To</th>
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
                  
                  {/* NEW: The Dispatch Dropdown! */}
                  <td style={{ padding: '15px' }}>
                    <select 
                      value={tree.assigned_to || ""} 
                      onChange={(e) => assignTicket(tree.id, e.target.value)}
                      style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: tree.assigned_to ? '#eff6ff' : 'white', color: tree.assigned_to ? '#1e3a8a' : '#64748b', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      <option value="" disabled>Unassigned</option>
                      {arborists.map(arborist => (
                        <option key={arborist.id} value={arborist.name}>{arborist.name}</option>
                      ))}
                    </select>
                  </td>

                  <td style={{ padding: '15px', textAlign: 'right' }}>
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
  );
}