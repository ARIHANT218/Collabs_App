import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import WorkspacePage from './pages/WorkspacePage'
import DocumentPage from './pages/DocumentPage'
import SearchPage from './pages/SearchPage'
import NotificationsPage from './pages/NotificationsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import AdminPage from './pages/AdminPage'
import { useEffect, useState } from 'react'

function useAuth() {
	const [token, setToken] = useState(() => localStorage.getItem('token'))
	const [user, setUser] = useState(() => {
		const raw = localStorage.getItem('user');
		if (!raw) return null;
		try {
			const user = JSON.parse(raw);
			if (!user) return null;
			return user;
		} catch (e) {
			console.error(e);
			return null;
		}	
	})

	
	useEffect(() => {
		// Refresh user if token exists but user not stored (e.g., after OAuth)
		if (token && !user) {
			fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
				.then(r => r.json()).then(d => { if (d?.user) { localStorage.setItem('user', JSON.stringify(d.user)); setUser(d.user) } })
				.catch(() => {})
		}
	}, [token, user])
	const login = (t, u) => { localStorage.setItem('token', t); localStorage.setItem('user', JSON.stringify(u)); setToken(t); setUser(u) }
	const logout = () => { localStorage.clear(); setToken(null); setUser(null) }
	return { token, user, login, logout }
}

function ProtectedRoute({ children }) {
	const token = localStorage.getItem('token')
	if (!token) return <Navigate to="/login" replace />
	return children
}

function AdminRoute({ children }) {
	const raw = localStorage.getItem('user')
	const user = raw ? JSON.parse(raw) : null
	if (!localStorage.getItem('token')) return <Navigate to="/login" replace />
	if (!user || user.role !== 'Admin') return <Navigate to="/" replace />
	return children
}

const navLinks = [
	{ to: '/', label: 'Dashboard', icon: '🏠' },
	{ to: '/search', label: 'Search', icon: '🔍' },
	{ to: '/notifications', label: 'Notifications', icon: '🔔' },
]

export default function App() {
	const { user, logout } = useAuth()
	const location = useLocation()
	return (
		<div className="layout">
			<aside className="sidebar">
				<div>
					<div style={{ fontWeight: 900, fontSize: '2rem', marginLeft: '1em', letterSpacing: '-1px', marginBottom: '2rem', color: 'var(--color-primary)' }}>Collabs</div>
					<nav>
						{navLinks.map(link => (
							<Link
								key={link.to}
								to={link.to}
								className={location.pathname === link.to ? 'active' : ''}
								style={{ display: 'flex', alignItems: 'center', gap: '0.8em' }}
							>
								<span style={{ fontSize: '1.27em' }}>{link.icon}</span> <span>{link.label}</span>
							</Link>
						))}
						{user?.role === 'Admin' && (
							<Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '0.8em' }}>
								<span style={{ fontSize: '1.18em' }}>👑</span> Admin
							</Link>
						)}
					</nav>
				</div>
				<div className="sidebar-footer" style={{ marginTop: 'auto', textAlign: 'center' }}>
					{user && <><div style={{ fontSize: '1em', fontWeight: 600 }}>{user.name} <span className="text-sub" style={{ fontWeight: 500 }}>({user.role})</span></div>
					<button onClick={logout} style={{ marginTop: '0.95em', width: '95%', minHeight: 33 }}>Logout</button></>}
				</div>
			</aside>


			<main className="content">
				<Routes>

					<Route path="/login" element={<LoginPage />} />
					<Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
					<Route path="/w/:workspaceId" element={<ProtectedRoute><WorkspacePage /></ProtectedRoute>} />
					<Route path="/w/:workspaceId/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
					<Route path="/d/:documentId" element={<ProtectedRoute><DocumentPage /></ProtectedRoute>} />
					<Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
					<Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
					<Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
				</Routes>
			</main>
		</div>
	)
}



