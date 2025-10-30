import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Link } from 'react-router-dom'

export default function DashboardPage() {
	const [items, setItems] = useState([])
	const [name, setName] = useState('')
	const [editId, setEditId] = useState(null)
	const [editName, setEditName] = useState('')
	const [editDesc, setEditDesc] = useState('')
	const [confirmDel, setConfirmDel] = useState(null)
	useEffect(() => {
		api.get('/workspaces').then(r => setItems(r.data.items))
	}, [])
	async function createWorkspace(e) {
		e.preventDefault()
		const { data } = await api.post('/workspaces', { name })
		setItems([data.item, ...items])
		setName('')
	}
	async function submitEdit(e) {
		e.preventDefault()
		const { data } = await api.put(`/workspaces/${editId}`, { name: editName, description: editDesc })
		setItems(items.map(ws => ws._id === editId ? data.item : ws))
		setEditId(null)
	}
	async function doDelete(id) {
		await api.delete(`/workspaces/${id}`)
		setItems(items.filter(ws => ws._id !== id))
		setConfirmDel(null)
	}
	function logout() {
		localStorage.clear(); window.location.href = '/login'
	}
	const user = (() => { const raw = localStorage.getItem('user'); return raw ? JSON.parse(raw) : null })()
	const isAdmin = user?.role === 'Admin'
	return (
		<div className="container">
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<h1 style={{marginBottom:'0.5rem' ,color:'black'}} >Dashboard</h1>
				<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
					{user && <span style={{ opacity: 0.8 }}>{user.name} ({user.role})</span>}
					<button onClick={logout}>Logout</button>
				</div>
			</div>
			{isAdmin && (
				<form onSubmit={createWorkspace} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
					<input placeholder="New workspace name" value={name} onChange={e => setName(e.target.value)} required />
					<button type="submit">Create</button>
				</form>
			)}
			<div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
				{items.map(w => (
					<div key={w._id} className="card" style={{ position: 'relative' }}>
						<Link to={`/w/${w._id}`} style={{ textDecoration:'none', color:'inherit' }}>
							<h3 style={{ marginTop: 0 }}>{w.name}</h3>
							<p style={{ marginBottom:0 }}>{w.description || 'No description'}</p>
						</Link>
						{isAdmin && (
							<div style={{ position:'absolute', top: 16, right: 18, display:'flex', gap:'0.6em' }}>
								<button className="button-ghost" style={{fontSize:'1.16em'}} title="Edit" onClick={()=>{setEditId(w._id);setEditName(w.name);setEditDesc(w.description||'')}}>✏️</button>
								<button className="button-ghost" style={{fontSize:'1.16em'}} title="Delete" onClick={()=>setConfirmDel(w._id)}>🗑️</button>
							</div>
						)}
					</div>
				))}
			</div>
			{editId && (
				<div className="card" style={{ position:'fixed', left:0, right:0, top:0, bottom:0, margin:'auto', zIndex:1111, maxWidth:420 }}>
					<h2>Edit Workspace</h2>
					<form onSubmit={submitEdit}>
						<input value={editName} onChange={e => setEditName(e.target.value)} required placeholder="Workspace name" />
						<input value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Description" />
						<div style={{display:'flex',gap:'.7em',marginTop:'1.2em'}}>
							<button type="submit">Save</button>
							<button type="button" className="button-ghost" onClick={()=>setEditId(null)}>Cancel</button>
						</div>
					</form>
				</div>
			)}
			{confirmDel && (
				<div className="card" style={{ position:'fixed', left:0, right:0, top:0, bottom:0, margin:'auto', zIndex:1111, maxWidth:370, textAlign:'center' }}>
					<div style={{marginBottom:'1.3em',fontWeight:600}}>Delete workspace?</div>
					<button onClick={()=>doDelete(confirmDel)} style={{background:'var(--color-accent)',color:'#1e1535'}}>Confirm</button>
					<button onClick={()=>setConfirmDel(null)} className="button-ghost">Cancel</button>
				</div>
			)}
		</div>
	)
}
