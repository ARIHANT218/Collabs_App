import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Link, useParams } from 'react-router-dom'

export default function WorkspacePage() {
	const { workspaceId } = useParams()
	const [docs, setDocs] = useState([])
	const [title, setTitle] = useState('')
	useEffect(() => {
		api.get(`/documents/${workspaceId}`).then(r => setDocs(r.data.items))
	}, [workspaceId])
	async function createDoc(e) {
		e.preventDefault()
		const { data } = await api.post(`/documents/${workspaceId}`, { title })
		setDocs([data.item, ...docs])
		setTitle('')
	}
	return (
		<div className="container">
			<h1 style={{marginBottom:'0.5rem' ,color:'black'}}>Workspace</h1>
			<form onSubmit={createDoc} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
				<input placeholder="New document title" value={title} onChange={e => setTitle(e.target.value)} required />
				<button type="submit">Create</button>
			</form>
			<div style={{ display: 'grid', gap: '0.5rem' }}>
				{docs.map(d => (
					<Link key={d._id} to={`/d/${d._id}`} className="card">
						{d.title}
					</Link>
				))}
			</div>
		</div>
	)
}
