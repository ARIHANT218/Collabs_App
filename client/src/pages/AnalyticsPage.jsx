import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useParams } from 'react-router-dom'

export default function AnalyticsPage() {
	const { workspaceId } = useParams()
	const [items, setItems] = useState([])
	useEffect(() => {
		api.get(`/analytics/summary/${workspaceId}`).then(r => setItems(r.data.items || []))
	}, [workspaceId])
	return (
		<div className="container">
			<h1>Analytics</h1>
			<div className="card">
				<table style={{ width: '100%', borderCollapse: 'collapse' }}>
					<thead>
						<tr>
							<th style={{ textAlign: 'left', padding: '0.5rem' }}>Event</th>
							<th style={{ textAlign: 'left', padding: '0.5rem' }}>Count (7d)</th>
						</tr>
					</thead>
					<tbody>
						{items.map((r, i) => (
							<tr key={i}>
								<td style={{ padding: '0.5rem' }}>{r._id?.type || 'unknown'}</td>
								<td style={{ padding: '0.5rem' }}>{r.count}</td>
							</tr>
						))}
						{items.length === 0 && (
							<tr><td style={{ padding: '0.5rem' }} colSpan={2}>No data</td></tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
}
