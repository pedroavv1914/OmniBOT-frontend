import { useEffect, useRef, useState } from 'react'
import { createConversation, sendIncomingEvent, listMessages, streamConversation, sendMessage, listConversations, listBots, listNumbers, getMe } from '../lib/api'

export default function Conversations() {
  const [botId, setBotId] = useState('')
  const [channel, setChannel] = useState('webchat')
  const [contact, setContact] = useState('anon')
  const [conversationId, setConversationId] = useState('')
  const [text, setText] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const [list, setList] = useState<any[]>([])
  const [limit, setLimit] = useState(20)
  const [offset, setOffset] = useState(0)
  const [status, setStatus] = useState<string|undefined>()
  const [loadingList, setLoadingList] = useState(false)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [error, setError] = useState<string|undefined>()
  const sseRef = useRef<EventSource|null>(null)
  const messagesRef = useRef<HTMLDivElement|null>(null)
  const [ownerId, setOwnerId] = useState('')
  const [bots, setBots] = useState<any[]>([])
  const [numbers, setNumbers] = useState<any[]>([])
  const [contacts, setContacts] = useState<string[]>([])
  const [selectedContact, setSelectedContact] = useState<string|undefined>()
  const [selectedNumber, setSelectedNumber] = useState<string>('')

  const createConv = async () => {
    try {
      setError(undefined)
      const c = await createConversation({ bot_id: botId, channel, contact_identifier: contact })
      setConversationId(c.id)
      setLoadingMsgs(true)
      const lm = await listMessages(c.id)
      setMessages(lm)
      setLoadingMsgs(false)
      connectSSE(c.id)
    } catch (e: any) {
      setError(e.message)
    }
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
    try {
      await sendIncomingEvent({ conversation_id: conversationId, text })
      setText('')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const sendOutgoing = async () => {
    if (!conversationId || !text) return
    try {
      const m = await sendMessage(conversationId, { sender_type: 'bot', direction: 'outgoing', channel, content: text })
      setMessages(prev => [...prev, m])
      setText('')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const loadConversations = async () => {
    try {
      setLoadingList(true)
      const items = await listConversations({ bot_id: botId || undefined, limit, offset, status })
      setList(items)
      const unique: string[] = Array.from(new Set<string>(items.map((i:any)=>String(i.contact_identifier))))
      setContacts(unique)
      if (!selectedContact && unique.length > 0) setSelectedContact(unique[0])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => { loadConversations() }, [botId, limit, offset, status])
  useEffect(() => () => { sseRef.current?.close() }, [])
  useEffect(() => {
    messagesRef.current?.scrollTo({ top: 999999, behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe()
        const owner = me?.auth_user_id || me?.id || ''
        setOwnerId(owner)
        const bs = await listBots(owner)
        setBots(bs)
        const ns = await listNumbers(owner)
        setNumbers(ns)
      } catch (e:any) {
        setError(e.message)
      }
    })()
  }, [])

  useEffect(() => {
    setSelectedNumber('')
    setSelectedContact(undefined)
  }, [botId])

  const filteredNumbers = numbers.filter((n:any)=>!botId || n.bot_id===botId)
  const contactsByNumber = selectedNumber ? contacts.filter(c=>c===selectedNumber) : contacts

  const openContact = async (contactId: string) => {
    const convs = list.filter((c:any)=>String(c.contact_identifier)===String(contactId))
    const latest = convs[0]
    if (!latest) return
    setSelectedContact(contactId)
    setConversationId(latest.id)
    setLoadingMsgs(true)
    const lm = await listMessages(latest.id)
    setMessages(lm)
    setLoadingMsgs(false)
    connectSSE(latest.id)
  }

  const Bubble = ({ m }: { m: any }) => {
    const outgoing = m.direction === 'outgoing' || m.sender_type === 'bot'
    return (
      <div className={`w-full flex ${outgoing ? 'justify-end' : 'justify-start'} mb-2`}>
        <div className={`max-w-[75%] px-3 py-2 rounded-2xl ${outgoing ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
          <div className="text-sm">{m.content}</div>
          {m.created_at && <div className={`text-[10px] mt-1 ${outgoing?'text-blue-100':'text-gray-500'}`}>{new Date(m.created_at).toLocaleTimeString()}</div>}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
        <div className="font-semibold mb-3 text-gray-900">Filtros</div>
        <div className="space-y-2 mb-6">
          <select className="w-full border rounded-lg p-2" value={botId} onChange={e=>setBotId(e.target.value)}>
            <option value="">Selecione um bot</option>
            {bots.map((b:any)=>(<option key={b.id} value={b.id}>{b.name}</option>))}
          </select>
          <select className="w-full border rounded-lg p-2" value={selectedNumber} onChange={e=>setSelectedNumber(e.target.value)}>
            <option value="">Todos os números</option>
            {filteredNumbers.map((n:any)=>(<option key={n.id} value={n.phone_number}>{n.phone_number}</option>))}
          </select>
        </div>
        <div className="font-semibold mb-2 text-gray-900">Contatos</div>
        <div className="h-48 overflow-auto border rounded-lg mb-2 p-2 text-sm">
          {loadingList && <div className="animate-pulse text-gray-500">Carregando...</div>}
          {!loadingList && contactsByNumber.map((c:string) => (
            <div
              key={c}
              className={`p-2 rounded-lg cursor-pointer hover:bg-gray-50 ${selectedContact===c?'bg-gray-100':''}`}
              onClick={()=>openContact(c)}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{c}</div>
                <div className="text-[11px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">{botId? 'bot' : ''}</div>
              </div>
              <div className="text-xs text-gray-600">{list.filter((x:any)=>x.contact_identifier===c).length} conversas</div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mb-6">
          <button className="px-2 py-1 rounded-lg bg-gray-200" onClick={()=>setOffset(Math.max(0, offset - limit))}>Anterior</button>
          <span className="text-xs">offset: {offset}</span>
          <button className="px-2 py-1 rounded-lg bg-gray-200" onClick={()=>setOffset(offset + limit)}>Próximo</button>
        </div>
        <div className="font-semibold mb-2 text-gray-900">Criar conversa</div>
        <div className="space-y-2">
          <input className="w-full border rounded-lg p-2" placeholder="Contato" value={contact} onChange={e=>setContact(e.target.value)} />
          <select className="w-full border rounded-lg p-2" value={channel} onChange={e=>setChannel(e.target.value)}>
            <option value="webchat">webchat</option>
            <option value="whatsapp">whatsapp</option>
            <option value="instagram">instagram</option>
          </select>
          <button className="w-full bg-black text-white rounded-lg p-2" onClick={createConv}>Criar</button>
        </div>
        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
      </div>
      <div className="bg-white p-4 rounded-xl shadow border border-gray-100 md:col-span-2">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold text-gray-900">Mensagens</div>
          {conversationId && <div className="text-xs text-gray-600">Conversa: <span className="font-mono">{conversationId}</span></div>}
        </div>
        <div ref={messagesRef} className="h-[480px] overflow-auto border rounded-lg mb-3 p-3 bg-gray-50">
          {loadingMsgs && <div className="animate-pulse text-gray-500">Carregando mensagens...</div>}
          {!loadingMsgs && messages.map((m, idx) => (
            <Bubble key={idx} m={m} />
          ))}
        </div>
        <div className="flex gap-2">
          <input className="flex-1 border rounded-lg p-2" placeholder="Digite uma mensagem" value={text} onChange={e=>setText(e.target.value)} />
          <button className="px-3 py-2 rounded-lg bg-blue-600 text-white" onClick={sendIncoming}>Enviar incoming</button>
          <button className="px-3 py-2 rounded-lg bg-green-600 text-white" onClick={sendOutgoing}>Enviar outgoing</button>
        </div>
        {selectedContact && (
          <div className="mt-4">
            <div className="text-sm text-gray-700 font-medium mb-2">Conversas com {selectedContact}</div>
            <div className="flex flex-wrap gap-2">
              {list.filter((c:any)=>c.contact_identifier===selectedContact).map((c:any)=> (
                <button
                  key={c.id}
                  className={`text-xs px-2 py-1 rounded border ${conversationId===c.id?'bg-gray-200':'bg-white'}`}
                  onClick={async()=>{
                    setConversationId(c.id)
                    setLoadingMsgs(true)
                    const lm = await listMessages(c.id)
                    setMessages(lm)
                    setLoadingMsgs(false)
                    connectSSE(c.id)
                  }}
                >
                  {c.channel} • <span className="font-mono">{c.id.slice(0,6)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
