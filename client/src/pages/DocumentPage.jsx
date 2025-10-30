import { useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'
import { useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import ReactMarkdown from 'react-markdown';

const socket = io('/', { withCredentials: true })

function canEdit() {
  const raw = localStorage.getItem('user');
  if (!raw) return false;
  const role = JSON.parse(raw).role;
  return role === 'Editor' || role === 'Admin';
}

export default function DocumentPage() {
  const { documentId } = useParams()
  const [doc, setDoc] = useState(null)
  const [title, setTitle] = useState('')
  const [versions, setVersions] = useState([])
  const [uploading, setUploading] = useState(false)
  const editorRef = useRef(null)

  useEffect(() => {
    socket.emit('doc:join', { documentId })
    socket.on('doc:update', ({ delta }) => {
      if (delta?.text && editorRef.current) {
        editorRef.current.value += delta.text
      }
    })
    return () => { socket.off('doc:update') }
  }, [documentId])

  useEffect(() => {
    api.get(`/documents/item/${documentId}`).then(r => {
      setDoc(r.data.item)
      setTitle(r.data.item.title)
      const text = r.data.item.content?.text || ''
      if (editorRef.current) editorRef.current.value = text
    })
    api.get(`/documents/${documentId}/versions`).then(r => setVersions(r.data.items || []))
  }, [documentId])

  async function save() {
    const content = { text: editorRef.current?.value || '' }
    await api.put(`/documents/${documentId}`, { title, content, message: 'edit', mentions: [] })
  }

  async function revert(idx) {
    const { data } = await api.post(`/documents/${documentId}/revert/${idx}`)
    setDoc(data.item)
    setTitle(data.item.title)
    if (editorRef.current) editorRef.current.value = data.item.content?.text || ''
    api.get(`/documents/${documentId}/versions`).then(r => setVersions(r.data.items || []))
  }

  function broadcastChange(e) {
    socket.emit('doc:update', { documentId, delta: { text: e.target.value.slice(-1) } })
  }


  async function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const wid = doc?.workspace || ''
      const { data } = await api.post(`/uploads/${wid}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      const url = data.item?.url || '#'
      const name = file.name
      let insert = ''
      if (file.type.startsWith('image/')) {
        insert = `\n![](${url})\n`
      } else {
        insert = `\n[${name}](${url})\n`
      }
      const textarea = editorRef.current
      if (textarea) {
        const start = textarea.selectionStart || 0
        const end = textarea.selectionEnd || 0

        const val = textarea.value
        textarea.value = val.slice(0, start) + insert + val.slice(end)

        textarea.selectionStart = textarea.selectionEnd = start + insert.length
        textarea.focus()
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container">

      <h1 style={{marginBottom:'0.5rem' ,color:'black'}} >Editor</h1>

    <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', marginBottom: '0.5rem' }} />
      <div style={{ marginBottom: '0.45em', display:'flex', gap:'1.2em', alignItems:'center' }}>
        {canEdit() && (
          <label style={{ cursor:'pointer', fontWeight:500, color:'var(--color-primary)', opacity: uploading?0.7:1 }}>
            📎 Attach file
            <input type="file" style={{ display:'none' }} disabled={uploading} onChange={handleFileSelect} />
          </label>
        )}
        {uploading && <span style={{fontSize:'1em', color:'var(--color-accent)'}}>Uploading...</span>}
      </div>
      <textarea ref={editorRef} onChange={broadcastChange} style={{ width: '100%', height: 320 }} className="card" />
      <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
        <button onClick={save}>Save</button>
      </div>



          {doc?.content?.text && (
      <div className="doc-preview card" style={{ '&:hover': { backgroundColor: 'lightblue' }, transition: 'background-color 0.3s ease', marginTop:'1.1em', marginBottom:'1.1em', background:'#fff'}}>
        <ReactMarkdown>{doc.content.text}</ReactMarkdown>
      </div>
    )}


      <div style={{ marginTop: '1rem' }} className="card">
        <h3 style={{ marginTop: 0 }}>Version history</h3>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {versions.map((v, i) => (
            <div key={i} style={{ '&:hover': { backgroundColor: 'blue' }, transition: 'background-color 0.3s ease',     display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{new Date(v.createdAt).toLocaleString()} — {v.message || 'update'}</span>
              <button onClick={() => revert(i)}>Revert</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
