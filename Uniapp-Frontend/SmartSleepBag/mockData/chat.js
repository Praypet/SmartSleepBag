// utils/chat.js
import { reactive } from 'vue'

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

// AI回复生成（模拟智能对话）
export const getAIReply = async (userMessage) => {
  const babyName = babyInfo.name || '宝宝'
  const currentSleepQuality = recentSleepRecords[0]?.quality || 85
  const isSleepingNow = sleepStatus.isSleeping
  const currentTemp = sensorsData.体温.value
  const currentHeart = sensorsData.心率.value
  const currentBreath = sensorsData.呼吸.value
  const currentMovement = sensorsData.体动.value
  
  const msg = userMessage.toLowerCase()
  
	if(msg=='宝宝今天睡得怎么样'){
		return '根据最新数据，宝宝今天睡眠质量评分92分，表现很不错。详细情况是：深睡时长4.5小时，夜醒次数只有1次，睡得非常安稳。目前宝宝正在睡眠中。宝宝今天的睡眠质量很好，继续保持这个节奏对宝宝发育很有帮助。需要我帮您记录宝宝的睡眠规律吗？'
	}
  // 睡眠相关
  if (msg.includes('睡眠') || msg.includes('睡') || msg.includes('觉')) {
    if (isSleepingNow) {
      return `${babyName}正在睡觉呢，当前睡眠状态良好~ 最近深睡时长${recentSleepRecords[0]?.deepSleep || 2.5}小时，继续加油！`
    } else {
      return `${babyName}现在醒着哦！最近${recentSleepRecords[0]?.date || ''}睡眠质量评分${currentSleepQuality}分，${currentSleepQuality > 80 ? '很不错呢👍' : '可以多注意一下睡眠环境🌙'}`
    }
  }
  
  // 体温相关
  if (msg.includes('体温') || msg.includes('发烧') || msg.includes('温度')) {
    return `当前${babyName}体温${currentTemp}℃，${currentTemp > 37.2 ? '略高，建议多观察' : currentTemp < 36.0 ? '体温偏低，注意保暖' : '正常范围，放心~'}`
  }
  
  // 心率相关
  if (msg.includes('心率') || msg.includes('心跳')) {
    return `当前${babyName}心率${currentHeart}次/分，${currentHeart > 130 ? '稍快，可以留意一下' : currentHeart < 100 ? '心率偏慢，建议观察' : '在正常范围内'}`
  }
  
  // 呼吸相关
  if (msg.includes('呼吸')) {
    return `当前${babyName}呼吸${currentBreath}次/分，${currentBreath > 35 ? '呼吸偏快，建议观察' : currentBreath < 20 ? '呼吸偏慢，注意监测' : '呼吸平稳正常'}`
  }
  
  // 体动相关
  if (msg.includes('体动') || msg.includes('翻身')) {
    return `${babyName}当前体动次数${currentMovement}次/小时，${currentMovement > 12 ? '活动较频繁，可能处于浅睡眠' : '活动正常'}`
  }
  
  // 提醒相关
  if (msg.includes('提醒') || msg.includes('注意') || msg.includes('建议')) {
    return `我来帮您记录！建议：${getSmartReminderMessage()}`
  }
  
  // 报告/分析相关
  if (msg.includes('报告') || msg.includes('分析') || msg.includes('数据')) {
    if (recentSleepRecords.length > 0) {
      const avgQuality = Math.floor(recentSleepRecords.reduce((sum, r) => sum + r.quality, 0) / recentSleepRecords.length)
      return `${babyName}本周平均睡眠质量${avgQuality}分，${avgQuality > 80 ? '整体表现优秀！点击报告页可查看详细数据✨' : '有提升空间，需要我提供改善建议吗？💪'}`
    }
    return `想查看${babyName}的详细报告吗？可以点击底部的报告页面哦~`
  }
  
  // 感谢相关
  if (msg.includes('谢谢') || msg.includes('感谢')) {
    return `不客气！有需要随时找我聊${babyName}的情况~ 我很乐意帮忙！`
  }
  
  // 打招呼
  if (msg.includes('你好') || msg.includes('嗨') || msg.includes('hi')) {
    return `你好呀！我是${chatConfig.name}，${babyName}的健康小助手~ 有什么可以帮你的吗？`
  }
  
  // 默认温馨回复
  const defaultReplies = [
    `收到啦！${babyName}最近${currentSleepQuality > 80 ? '状态棒棒哒' : '可以多关注睡眠质量'}，需要我分析详细数据吗？`,
    `我会一直陪着${babyName}成长！想了解睡眠、体温还是其他指标呢？`,
    `有我在，${babyName}的健康随时掌握~ 点击上方卡片可以查看完整报告哦`,
    `${babyName}今天${isSleepingNow ? '在甜睡中' : '醒着玩呢'}，有什么想了解的吗？`,
    `随时可以问我关于${babyName}的睡眠、体温、心率等问题~`,
    `需要我帮你记录${babyName}的日常吗？`
  ]
  return defaultReplies[Math.floor(Math.random() * defaultReplies.length)]
}

// 添加消息
export const addMessage = (role, content) => {
  chatState.messages.push({
    role,
    content,
    time: Date.now(),
    id: Date.now() + Math.random()
  })
}

// 发送消息并获取回复
export const sendUserMessage = async (message) => {
  if (!message.trim()) return false
  
  // 添加用户消息
  addMessage('user', message.trim())
  chatState.isTyping = true
  
  try {
    // 模拟AI思考延迟
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500))
    const reply = await getAIReply(message)
    addMessage('assistant', reply)
    // 清除未读计数（用户主动聊天时）
    chatState.unreadCount = 0
    return true
  } catch (error) {
    console.error('AI回复失败:', error)
    addMessage('assistant', ' 稍等一下，我缓一缓再回答你~')
    return false
  } finally {
    chatState.isTyping = false
  }
}

// 打开聊天窗口
export const openChat = () => {
  chatState.visible = true
  // 清除提醒状态
  chatState.showReminder = false
  chatState.reminderMessage = ''
  chatState.unreadCount = 0
  
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