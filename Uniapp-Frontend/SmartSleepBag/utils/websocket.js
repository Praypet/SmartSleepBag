import { addMessage } from '@/api/chat.js'
let socketTask = null
let heartbeatTimer = null

export function connectBabySocket() {
  socketTask = wx.connectSocket({
    url: 'ws://172.18.176.1:3001/ws',
    success() {
      console.log('开始连接 WebSocket')
    }
  })

  socketTask.onOpen(() => {
    console.log('WebSocket 已连接')
  })

  socketTask.onMessage((res) => {
    const message = JSON.parse(res.data)
    console.log('收到服务端消息:', message)

    if (message.event === 'connected') {
      startHeartbeat()
    }

    if (message.event === 'ping') {
      sendSocketMessage('pong', {
        clientTime: new Date().toISOString()
      })
    }

    if (message.event === 'agent_response') {
      console.log('AI 返回结果:', message.data)
			addMessage('assistant',message.data.content)
    }
  })

  socketTask.onError((err) => {
    console.error('WebSocket 错误:', err)
  })

  socketTask.onClose(() => {
    console.log('WebSocket 已关闭')
    stopHeartbeat()
  })
}

export function sendSocketMessage(event, data) {
  if (!socketTask) return
  socketTask.send({
    data: JSON.stringify({
      event,
      data
    })
  })
}

export function sendChatMessage(input, babyId, userId) {
	addMessage('user',input)
  sendSocketMessage('chat_message', {
    input,
    babyId,
    userId
  })
}

function startHeartbeat() {
  stopHeartbeat()

  heartbeatTimer = setInterval(() => {
    sendSocketMessage('ping', {
      clientTime: new Date().toISOString()
    })
  }, 30000)
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
}
