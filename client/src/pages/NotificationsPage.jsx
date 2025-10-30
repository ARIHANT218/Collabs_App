import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function NotificationsPage() {
	const [items, setItems] = useState([])
	useEffect(() => { api.get('/notifications').then(r => setItems(r.data.items)) }, [])
	async function markRead(id) {
		await api.post(`/notifications/${id}/read`)
		setItems(items.map(n => n._id === id ? { ...n, readAt: new Date().toISOString() } : n))
	}
	return (
		<div className="container">
			<h1>Notifications</h1>
			<div className="card" style={{ display: 'grid', gap: '0.5rem' }}>
				{items.map(n => (
					<div key={n._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<div>
							<div style={{ fontWeight: 600 }}>{n.type}</div>
							<div style={{ opacity: 0.8 }}>{new Date(n.createdAt).toLocaleString()}</div>
						</div>
						<div>
							{!n.readAt && <button onClick={() => markRead(n._id)}>Mark read</button>}
						</div>
					</div>
				))}
				{items.length === 0 && <div>No notifications</div>}
			</div>
		</div>
	)
}
