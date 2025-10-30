import { useEffect, useState } from 'react'
import axios from 'axios'

const googleSvg = (
  <svg viewBox="0 0 32 32" width="22" height="22" style={{marginRight:8}}><g><path fill="#4285F4" d="M31.68 16.364c0-1.212-.108-2.092-.344-3.004H16.305v5.471h8.767c-.18 1.46-1.158 3.662-3.334 5.127l-.03.197 4.847 3.763.336.034c3.08-2.846 4.843-7.044 4.843-11.588z"/><path fill="#34A853" d="M16.305 31c4.163 0 7.65-1.365 10.201-3.732l-4.86-3.773c-1.322.902-3.112 1.534-5.341 1.534-4.085 0-7.546-2.709-8.788-6.457l-.18.016-4.76 3.824-.062.17C5.574 28.496 10.596 31 16.305 31z"/><path fill="#FBBC05" d="M7.516 18.533A8.607 8.607 0 016.94 16c0-.880.15-1.738.258-2.533l-.004-.171-4.824-3.832-.158.073A15.003 15.003 0 001.306 16c0 2.489.602 4.847 1.654 6.841l5.156-4.308z"/><path fill="#EB4335" d="M16.305 6.64c2.898 0 4.854 1.239 5.97 2.276l4.352-4.21C24.947 2.243 20.468 0 16.305 0 10.596 0 5.574 2.504 2.155 6.917l5.224 4.307c1.242-3.748 4.703-6.584 8.926-6.584z"/></g></svg>
)
const githubSvg = (
  <svg viewBox="0 0 24 24" fill="none" width="22" height="22" style={{marginRight:8}}><path fill="#181717" fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.418 2.865 8.166 6.839 9.504.5.088.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.157-1.11-1.465-1.11-1.465-.907-.62.069-.608.069-.608 1.002.07 1.529 1.032 1.529 1.032.892 1.53 2.341 1.089 2.91.833.09-.647.35-1.09.636-1.341-2.221-.253-4.555-1.114-4.555-4.957 0-1.094.39-1.988 1.03-2.688-.103-.253-.447-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.54 9.54 0 012.5.336c1.909-1.296 2.748-1.026 2.748-1.026.546 1.378.202 2.397.1 2.65.64.7 1.029 1.594 1.029 2.688 0 3.851-2.337 4.701-4.566 4.949.359.309.678.918.678 1.852 0 1.336-.012 2.417-.012 2.747 0 .267.18.574.688.477C19.137 20.18 22 16.432 22 12.017 22 6.484 17.523 2 12 2z" clipRule="evenodd"/></svg>
)

export default function LoginPage() {
 const [mode, setMode] = useState('login')
 const [name, setName] = useState('')
 const [email, setEmail] = useState('')
 const [password, setPassword] = useState('')
 const [role, setRole] = useState('Editor')
 const [inviteCode, setInviteCode] = useState('')
 const [error, setError] = useState('')

 useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')
  if (token) {
   localStorage.setItem('token', token)
   axios.get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
    .then(({ data }) => { localStorage.setItem('user', JSON.stringify(data.user)); window.location.href = '/' })
    .catch(() => { window.location.href = '/' })
  }
  const err = params.get('error')
  if (err) setError(err)
 }, [])

 async function submit(e) {
  e.preventDefault()
  setError('')
  try {
   if (mode === 'login') {
    const { data } = await axios.post('/api/auth/login', { email, password, inviteCode })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    window.location.href = '/'
   } else {
    const body = { name, email, password, role, inviteCode: role === 'Admin' ? inviteCode : undefined }
    const { data } = await axios.post('/api/auth/register', body)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    window.location.href = '/'
   }
  } catch (err) {
   setError(err?.response?.data?.error || 'Failed')
  }
 }

 function startGoogle() { window.location.href = '/api/auth/oauth/google/start' }
 function startGithub() { window.location.href = '/api/auth/oauth/github/start' }

 return (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
   <form className="login-card" onSubmit={submit} style={{width: 370, maxWidth:'96vw', margin: '3.5em 0', boxShadow:"0 4px 38px #2e155240,0 2px 18px #fff2"}}>
    <h1 style={{ margin:'1.3em 0 0.13em',fontWeight:700, fontSize:'2em', letterSpacing:'-1px', color:'var(--color-card)' }}>
     {mode === 'login' ? 'Welcome back' : 'Sign up for an account'}
    </h1>
    <div className="login-subhead" style={{ color: 'var(--color-text-sub)', marginBottom:'1.43em', fontWeight:500, fontSize:'1.17em' }}>
     {mode==='login'
      ? 'Sign in to your account to continue'
      : 'Create your account—fast collaborative docs!'}
    </div>
    <div style={{ display:'flex', gap:'0.7em', marginBottom:'1.2em', justifyContent:'center'}}>
     <button type="button" className="oauth-btn" style={{border:'1.5px solid #c9bbeb',background:'#fff',color:'#222',display:'flex',alignItems:'center',flex:1,borderRadius:'.85em',fontSize:'1.07em',fontWeight:600,padding:'.5em 1em',cursor:'pointer'}} onClick={startGoogle}>{googleSvg}Google</button>
     <button type="button" className="oauth-btn" style={{border:'1.5px solid #c9bbeb',background:'#fff',color:'#222',display:'flex',alignItems:'center',flex:1,borderRadius:'.85em',fontSize:'1.07em',fontWeight:600,padding:'.5em 1em',cursor:'pointer'}} onClick={startGithub}>{githubSvg}GitHub</button>
    </div>
    <div style={{ textAlign:'center',color:'var(--color-text-sub)',fontSize:'1em',letterSpacing:'0.04em',marginBottom:'2em'}}>OR CONTINUE WITH</div>
    {mode==='register' && (
     <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required style={{marginBottom:"0.73em"}} />
    )}
    <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{marginBottom:"0.73em"}} />
    <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{marginBottom:"0.73em"}} />
    {mode === 'register' && (
     <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', margin:'0.55em 0' }}>
      <label>Role:</label>
      <select value={role} onChange={e => setRole(e.target.value)} style={{flex:1}}>
       <option>Editor</option>
       <option>Viewer</option>
       <option>Admin</option>
      </select>
     </div>
    )}
    {(mode === 'login' || role === 'Admin') && (
     <input placeholder="Admin invite code (only for Admin)" value={inviteCode} onChange={e => setInviteCode(e.target.value)} style={{marginBottom:"0.73em"}} />
    )}
    {error && <div style={{ color: 'var(--color-accent)', marginBottom:'0.68em', fontWeight:'bold'}}>{error}</div>}
    <button type="submit" style={{width:'100%',background:'var(--color-accent)',color:'#222',fontWeight:700,margin:'1.1em 0 0.82em',padding:'0.66em 0',fontSize:'1.19em',boxShadow:"0 1px 8px #fbbf2412",borderRadius:".99em"}}>
     {mode==='login'? 'Login' : 'Register'}
    </button>
    <div style={{ textAlign:'center', color:'var(--color-text-sub)',fontSize:'1em', padding:'0.3em 0.3em 0.1em' }}>
     {mode==='login' 
      ?  <span>Don’t have an account? <span style={{color:'var(--color-accent)',fontWeight:600, cursor:'pointer'}} onClick={()=>setMode('register')}>Sign up</span></span>
      :  <span>Already have an account? <span style={{color:'var(--color-accent)',fontWeight:600, cursor:'pointer'}} onClick={()=>setMode('login')}>Sign in</span></span>
     }
    </div>
   </form>
  </div>
 )
}
