// utils/chat.js
import { reactive } from 'vue'
import { connectBabySocket } from '@/utils/websocket.js'

// 聊天机器人配置
export const chatConfig = reactive({
  avatar: '/static/chat.jpg', // 可爱云朵宝宝形象
  name: '安安'
})

// 聊天状态
export const chatState = reactive({
  visible: false,
  messages: [],
  unreadCount: 0,
  showReminder: false,
  reminderMessage: '',
  isTyping: false
})

// 宝宝相关数据（从home组件同步过来）
let babyInfo = {
	id:1,
  name: '宝宝',
  age: '',
  gender: ''
}

// 传感器数据（从home组件同步过来）
let sensorsData = {
  体温: { value: 36.5, unit: '℃' },
  心率: { value: 120, unit: '次/分' },
  呼吸: { value: 28, unit: '次/分' },
  体动: { value: 8, unit: '次' }
}

// 睡眠状态（从home组件同步过来）
let sleepStatus = {
  isSleeping: true,
  text: '睡眠中'
}

// 最近睡眠记录（从home组件同步过来）
let recentSleepRecords = []

// 更新外部数据的方法（供home组件调用）
export const updateBabyInfo = (info) => {
  if (info) babyInfo = { ...babyInfo, ...info }
}

export const updateSensors = (sensors) => {
  if (sensors && sensors.length) {
    sensors.forEach(s => {
      if (sensorsData[s.label]) {
        sensorsData[s.label] = { value: s.value, unit: s.unit }
      }
    })
  }
}

export const updateSleepStatus = (status) => {
  if (status) sleepStatus = { ...sleepStatus, ...status }
}

export const updateRecentSleep = (records) => {
  if (records && records.length) recentSleepRecords = records
}

// 智能提醒文案生成
export const getSmartReminderMessage = () => {
  const hour = new Date().getHours()
  const isSleeping = sleepStatus.isSleeping
  const babyName = babyInfo.name || '宝宝'
  
  if (hour >= 21 || hour < 6) {
    return `晚安~ ${babyName}睡得香吗？明天可以和我聊聊睡眠情况哦`
  } else if (hour >= 12 && hour <= 14) {
    return `${babyName}午睡时间到啦，记得观察呼吸和体温哦`
  } else if (!isSleeping && (hour >= 7 && hour <= 10)) {
    return `早上好！${babyName}醒了没？今天的精神状态怎么样？`
  } else {
    const reminders = [
      `来聊聊${babyName}最近的变化吧~`,
      `想看看${babyName}这周的睡眠报告吗？`,
      `最近${babyName}的饮食怎么样？`,
      `和我说说${babyName}今天的小趣事吧~`,
      `${babyName}今天的活动量如何？`,
      `需要我帮你记录${babyName}的成长点滴吗？`
    ]
    return reminders[Math.floor(Math.random() * reminders.length)]
  }
}

// 添加消息
export const addMessage = (role, content) => {
	if(role==='assistant'){ chatState.isTyping = false }
  chatState.messages.push({
    role,
    content,
    time: Date.now(),
    id: Date.now()
  })
}

// 打开聊天窗口
export const openChat = () => {
  chatState.visible = true
  // 清除提醒状态
  chatState.showReminder = false
  chatState.reminderMessage = ''
  chatState.unreadCount = 0
  
	connectBabySocket()
	
  // 如果是首次打开，添加欢迎语
  if (chatState.messages.length === 0) {
    setTimeout(() => {
      addMessage('assistant', `嗨！我是${chatConfig.name}，${babyInfo.name || '宝宝'}的健康小助手~ 有任何问题或想分享的都可以和我说哦！`)
    }, 300)
  }
}

// 关闭聊天窗口
export const closeChat = () => {
  chatState.visible = false
}

// 触发提醒（外部调用）
export const triggerReminder = () => {
  if (chatState.visible) return // 窗口打开时不提醒
  
  chatState.reminderMessage = getSmartReminderMessage()
  chatState.showReminder = true
  chatState.unreadCount += 1
  
  // 8秒后自动隐藏提醒气泡
  setTimeout(() => {
    if (chatState.showReminder) {
      chatState.showReminder = false
    }
  }, 8000)
}

// 清除提醒
export const clearReminder = () => {
  chatState.showReminder = false
  chatState.reminderMessage = ''
}

// 重置聊天历史（可选）
export const resetChat = () => {
  chatState.messages = []
  chatState.unreadCount = 0
  chatState.showReminder = false
  chatState.isTyping = false
}