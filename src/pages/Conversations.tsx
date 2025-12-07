import { useEffect, useRef, useState } from 'react'
import { createConversation, sendIncomingEvent, listMessages, streamConversation, sendMessage, listConversations, getActiveWorkspaceId } from '../lib/api'

export default function Conversations() {
  const [botId, setBotId] = useState('')
  const [channel, setChannel] = useState('webchat')
  const [contact, setContact] = useState('anon')
  const [conversationId, setConversationId] = useState('')
  const [text, setText] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const sseRef = useRef<EventSource|null>(null)
  const [list, setList] = useState<any[]>([])
  const [limit, setLimit] = useState(20)
  const [offset, setOffset] = useState(0)
  const [status, setStatus] = useState<string|undefined>()
  const wsId = getActiveWorkspaceId()

  const createConv = async () => {
    const c = await createConversation({ bot_id: botId, channel, contact_identifier: contact })
    setConversationId(c.id)
    const list = await listMessages(c.id)
    setMessages(list)
    connectSSE(c.id)
  }

  const connectSSE = (id: string) => {
    if (sseRef.current) sseRef.current.close()
    const es = streamConversation(id)
    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data)
        setMessages(prev => [...prev, data])
      } catch {}
    }
    sseRef.current = es
  }

  const sendIncoming = async () => {
    if (!conversationId || !text) return
    await sendIncomingEvent({ conversation_id: conversationId, text })
    setText('')
  }

  const sendOutgoing = async () => {
    if (!conversationId || !text) return
    const m = await sendMessage(conversationId, { sender_type: 'bot', direction: 'outgoing', channel, content: text })
    setMessages(prev => [...prev, m])
    setText('')
  }

  const loadConversations = async () => {
    const items = await listConversations({ bot_id: botId || undefined, workspace_id: wsId || undefined, limit, offset, status })
    setList(items)
  }

  useEffect(() => { loadConversations() }, [botId, wsId, limit, offset, status])

  useEffect(() => () => { sseRef.current?.close() }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-4 rounded shadow">
        <div className="font-semibold mb-2">Criar conversa</div>
        <input className="w-full border rounded p-2 mb-2" placeholder="Bot ID" value={botId} onChange={e=>setBotId(e.target.value)} />
        <input className="w-full border rounded p-2 mb-2" placeholder="Contato" value={contact} onChange={e=>setContact(e.target.value)} />
        <select className="w-full border rounded p-2 mb-2" value={channel} onChange={e=>setChannel(e.target.value)}>
          <option value="webchat">webchat</option>
          <option value="whatsapp">whatsapp</option>
          <option value="instagram">instagram</option>
        </select>
        <button className="w-full bg-black text-white rounded p-2" onClick={createConv}>Criar</button>
        {conversationId && <div className="mt-2 text-sm">ID: {conversationId}</div>}
        <div className="mt-6">
          <div className="font-semibold mb-2">Conversas</div>
          <div className="flex gap-2 mb-2">
            <input className="border rounded p-2 flex-1" placeholder="Bot ID (filtro)" value={botId} onChange={e=>setBotId(e.target.value)} />
            <select className="border rounded p-2" value={status||''} onChange={e=>setStatus(e.target.value||undefined)}>
              <option value="">status</option>
              <option value="open">open</option>
              <option value="closed">closed</option>
            </select>
          </div>
          <div className="h-40 overflow-auto border rounded mb-2 p-2 text-sm">
            {list.map((c:any) => (
              <div key={c.id} className={`p-2 rounded cursor-pointer ${conversationId===c.id?'bg-gray-100':''}`} onClick={async()=>{ setConversationId(c.id); const lm = await listMessages(c.id); setMessages(lm); connectSSE(c.id) }}>
                <div className="font-mono text-xs">{c.id}</div>
                <div>{c.contact_identifier} • {c.channel} • {c.status}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button className="px-2 py-1 rounded bg-gray-200" onClick={()=>setOffset(Math.max(0, offset - limit))}>Anterior</button>
            <span className="text-xs">offset: {offset}</span>
            <button className="px-2 py-1 rounded bg-gray-200" onClick={()=>setOffset(offset + limit)}>Próximo</button>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow md:col-span-2">
        <div className="font-semibold mb-2">Mensagens</div>
        <div className="h-64 overflow-auto border rounded mb-3 p-2">
          {messages.map((m, idx) => (
            <div key={idx} className="mb-1 text-sm">
              <span className="font-mono mr-2">[{m.direction}]</span>
              <span>{m.content}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="flex-1 border rounded p-2" placeholder="Digite uma mensagem" value={text} onChange={e=>setText(e.target.value)} />
          <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={sendIncoming}>Enviar incoming</button>
          <button className="px-3 py-2 rounded bg-green-600 text-white" onClick={sendOutgoing}>Enviar outgoing</button>
        </div>
      </div>
    </div>
  )
}
