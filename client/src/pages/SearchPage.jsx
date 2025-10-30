import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Link, useSearchParams } from 'react-router-dom'

export default function SearchPage() {
	const [params, setParams] = useSearchParams()
	const [q, setQ] = useState(params.get('q') || '')
	const [items, setItems] = useState([])

	useEffect(() => {
		const current = params.get('q') || ''
		if (!current) { setItems([]); return }
		api.get(`/search`, { params: { q: current } }).then(r => setItems(r.data.items))
	}, [params])

	function submit(e) {
		e.preventDefault(); setParams({ q })
	}

	return (
		<div className="container">
			<h1 style={{marginBottom:'0.5rem' ,color:'black'}}>Search</h1>
			<form onSubmit={submit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
				<input placeholder="Search documents" value={q} onChange={e => setQ(e.target.value)} />
				<button type="submit">Search</button>
			</form>
			<div className="card">
				{items.map(d => (
					<div key={d._id} style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
						<Link to={`/d/${d._id}`}>{d.title}</Link>
					</div>
				))}
				{items.length === 0 && <div>No results</div>}
			</div>
		</div>
	)
}
