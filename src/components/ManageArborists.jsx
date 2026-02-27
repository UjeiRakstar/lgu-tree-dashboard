// src/components/ManageArborists.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function ManageArborists() {
  const [arborists, setArborists] = useState([]);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    fetchArborists();
  }, []);

  async function fetchArborists() {
    const { data, error } = await supabase.from('arborists').select('*').order('created_at', { ascending: false });
    if (!error) setArborists(data);
  }

  async function addArborist(e) {
    e.preventDefault();
    if (!newName) return;

    const { error } = await supabase.from('arborists').insert([{ name: newName }]);
    if (!error) {
      setNewName('');
      fetchArborists();
      alert('Arborist successfully added to the dispatch roster!');
    } else {
      alert('Error adding arborist.');
    }
  }

  async function removeArborist(id) {
    const confirmDelete = window.confirm("Remove this arborist from the active roster?");
    if (!confirmDelete) return;

    const { error } = await supabase.from('arborists').delete().eq('id', id);
    if (!error) fetchArborists();
  }

  return (
    <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderTop: '5px solid #3b82f6' }}>
      <h2 style={{ color: '#333', marginTop: 0, marginBottom: '20px', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>
        👥 Field Team Roster
      </h2>
      
      {/* Add Arborist Form */}
      <form onSubmit={addArborist} style={{ display: 'flex', gap: '10px', marginBottom: '30px', backgroundColor: '#eff6ff', padding: '15px', borderRadius: '8px' }}>
        <input 
          type="text" 
          placeholder="Enter Arborist Name (e.g., Juan Dela Cruz)" 
          value={newName} 
          onChange={(e) => setNewName(e.target.value)} 
          style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #bfdbfe', fontSize: '1rem' }}
          required
        />
        <button type="submit" style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          + Add to Roster
        </button>
      </form>

      {/* Arborist List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
        {arborists.map(arborist => (
          <div key={arborist.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontWeight: 'bold', color: '#334155' }}>👷‍♂️ {arborist.name}</span>
            <button onClick={() => removeArborist(arborist.id)} style={{ backgroundColor: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
              Remove
            </button>
          </div>
        ))}
        {arborists.length === 0 && <p style={{ color: '#64748b' }}>No arborists in the system yet.</p>}
      </div>
    </div>
  );
}