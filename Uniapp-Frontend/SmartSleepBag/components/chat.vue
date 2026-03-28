<!-- components/chat.vue -->
<template>
  <!-- 悬浮聊天按钮 -->
  <view class="chat-float-btn" @click="handleOpenChat" :class="{ 'pulse-animation': chatState.showReminder }">
    <view class="avatar-wrapper" :class="{ 'breathing': !chatState.visible }">
      <image 
        class="chat-avatar" 
        :src="chatConfig.avatar" 
        mode="aspectFill"
      ></image>
      <!-- 动态光晕效果 -->
      <view class="glow-effect"></view>
      <!-- 未读提醒小红点 -->
      <view v-if="chatState.unreadCount > 0" class="badge">
        {{ chatState.unreadCount > 99 ? '99+' : chatState.unreadCount }}
      </view>
    </view>
    <!-- 悬浮提示气泡（自动提醒） -->
    <transition name="bubble-fade">
      <view v-if="chatState.showReminder && chatState.reminderMessage" class="reminder-bubble" @click.stop="handleOpenChat">
        <view class="bubble-content">
          <text class="bubble-text">💬 {{ chatState.reminderMessage }}</text>
        </view>
        <view class="bubble-tail"></view>
      </view>
    </transition>
  </view>
  
  <!-- 聊天抽屉弹窗 -->
  <transition name="drawer-fade">
    <view class="chat-drawer-mask" v-if="chatState.visible" @click="handleCloseChat">
      <transition name="drawer-slide">
        <view class="chat-drawer" @click.stop v-if="chatState.visible">
          <view class="drawer-header">
            <view class="header-info">
              <view class="avatar-container">
                <image class="header-avatar" :src="chatConfig.avatar" mode="aspectFill"></image>
                <view class="online-dot"></view>
              </view>
              <view class="header-text">
                <text class="header-name">{{ chatConfig.name }}</text>
                <text class="header-status">在线 · 随时为你服务</text>
              </view>
            </view>
            <view class="close-btn" @click="handleCloseChat">
              <uni-icons type="closeempty" size="24" color="#ff88b0"></uni-icons>
            </view>
          </view>
          
          <!-- 聊天消息列表 -->
          <scroll-view 
            class="chat-messages" 
            scroll-y 
						:scroll-into-view="scrollToView"
            scroll-with-animation
            :show-scrollbar="false"
          >
            <!-- 加载动画 -->
            <view v-if="isLoadingMessages" class="loading-container">
              <view class="loading-dots">
                <view class="dot"></view>
                <view class="dot"></view>
                <view class="dot"></view>
              </view>
              <text class="loading-text">加载聊天记录中...</text>
            </view>
            
            <!-- 消息列表 --> 
            <view v-for="(msg, idx) in chatState.messages" :key="msg.id || idx" :id="'msg-' + msg.id">
              <transition name="message-fade" appear>
                <view class="message-item" :class="msg.role">
                  <!-- 助手头像 -->
                  <view v-if="msg.role === 'assistant'" class="avatar-circle">
                    <image class="msg-avatar" :src="chatConfig.avatar" mode="aspectFill"></image>
                  </view>
                  
                  <view class="message-wrapper">
										<view class="msg-bubble" :class="msg.role">
											<text class="msg-content">{{ msg.content }}</text>
										</view>
										<text class="msg-time">{{ formatTime(msg.time) }}</text>
                  </view>
                  
                  <!-- 用户头像 -->
                  <view v-if="msg.role === 'user'" class="avatar-circle user">
                    <image class="msg-avatar user-avatar" src="/static/avatar.png" mode="aspectFill"></image>
                  </view>
                </view>
              </transition>
            </view>
						<transition name="typing-fade">
							<view v-if="chatState.isTyping" class="message-item assistant typing">
								<view class="avatar-circle">
									<image class="msg-avatar" :src="chatConfig.avatar" mode="aspectFill"></image>
								</view>
								<view class="typing-bubble">
									<view class="typing-dots">
										<view class="typing-dot"></view>
										<view class="typing-dot"></view>
										<view class="typing-dot"></view>
									</view>
									<text class="typing-text">思考中...</text>
								</view>
							</view>
						</transition>
          </scroll-view>
          
          <!-- 快捷回复区域 -->
          <view class="quick-replies" v-if="quickReplies.length > 0">
            <scroll-view scroll-x class="quick-scroll" :show-scrollbar="false">
              <view 
                v-for="reply in quickReplies" 
                :key="reply" 
                class="quick-reply-item"
                @click="handleQuickReply(reply)"
              >
                <text>{{ reply }}</text>
              </view>
            </scroll-view>
          </view>
          
          <!-- 输入区域 -->
          <view class="chat-input-area">
            <view class="input-wrapper">
              <input 
                class="chat-input" 
                v-model="inputMessage" 
                placeholder="聊聊宝宝近况吧~" 
                placeholder-style="color: #c9a9c9"
                confirm-type="send"
                @confirm="handleSendMessage"
                @focus="onInputFocus"
                @blur="onInputBlur"
              />
              <view class="input-actions">
                <view class="action-icon" @click="handleVoiceInput">
                  <uni-icons type="mic" size="22" color="#ff88b0"></uni-icons>
                </view>
              </view>
            </view>
            <view class="send-btn" :class="{ 'active': inputMessage.trim() }" @click="handleSendMessage">
              <uni-icons type="paperplane" size="20" color="#fff"></uni-icons>
            </view>
          </view>
        </view>
      </transition>
    </view>
  </transition>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { 
  chatConfig, 
  chatState, 
  openChat, 
  closeChat, 
  clearReminder,
  updateBabyInfo,
  updateSensors,
  updateSleepStatus,
  updateRecentSleep,
	triggerReminder
} from '@/api/chat.js'
import { sendChatMessage } from '@/utils/websocket.js'

// 本地响应式数据
const inputMessage = ref('')
const scrollToView = ref('')
const isLoadingMessages = ref(false)
const quickReplies = ref(['睡眠怎么样？', '体温正常吗？', '今日提醒', '成长记录'])
const babyInfo = ref('')

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// 监听消息变化，自动滚动到底部
watch(
  () => chatState.messages.length,
  async () => {
    await nextTick()
    if (chatState.messages.length > 0) {
      scrollToView.value = `msg-${chatState.messages[chatState.messages.length-1].id}`
    }
  }
)

// 打开聊天
const handleOpenChat = async () => {
  isLoadingMessages.value = true
  openChat()
  clearReminder()
  
  // 模拟加载延迟
  setTimeout(() => {
    isLoadingMessages.value = false
  }, 500)
}

// 关闭聊天
const handleCloseChat = () => {
  closeChat()
}

// 发送消息
const handleSendMessage = () => {
  if (!inputMessage.value.trim()) return
  const message = inputMessage.value
  inputMessage.value = ''
	chatState.isTyping = true
  sendChatMessage(message)
}

// 快捷回复
const handleQuickReply = (reply) => {
  inputMessage.value = reply
  handleSendMessage()
}

// 输入框聚焦
const onInputFocus = () => {
  // 滚动到底部
  nextTick(() => {
    scrollToView.value = `msg-${chatState.messages[chatState.messages.length-1].id}`
  })
}

// 输入框失焦
const onInputBlur = () => {
  // 可以在这里做些什么
}

// 语音输入（模拟）
const handleVoiceInput = () => {
  uni.showToast({
    title: '语音功能开发中',
    icon: 'none',
    duration: 1500
  })
}

// 表情选择（模拟）
const handleEmoji = () => {
  uni.showToast({
    title: '表情功能开发中',
    icon: 'none',
    duration: 1500
  })
}

// 暴露更新数据的方法给父组件
const updateChatData = (data) => {
  if (data.babyInfo) {
		babyInfo.value = {...data.babyInfo,id:1}
		updateBabyInfo(data.babyInfo)
	}
  if (data.sensors) updateSensors(data.sensors)
  if (data.sleepStatus) updateSleepStatus(data.sleepStatus)
  if (data.recentSleep) updateRecentSleep(data.recentSleep)
}

// 暴露触发提醒的方法
const showReminder = () => {
  triggerReminder()
}

// 暴露给父组件使用
defineExpose({
  updateChatData,
  showReminder
})
</script>

<style lang="scss" scoped>
// 清透蓝粉渐变主题
.chat-float-btn {
  position: fixed;
  bottom: 300rpx;
  right: 60rpx;
  z-index: 1000;
  
  .avatar-wrapper {
    position: relative;
    width: 120rpx;
    height: 120rpx;
    background: linear-gradient(135deg, rgba(255, 182, 217, 0.9), rgba(255, 136, 176, 0.9));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 12rpx 28rpx rgba(255, 105, 180, 0.3);
    transition: all 0.3s ease;
    animation: float 3s ease-in-out infinite;
    backdrop-filter: blur(10px);
    border: 2rpx solid rgba(255, 255, 255, 0.6);
    
    .chat-avatar {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
      border: 3rpx solid #fff;
      z-index: 2;
    }
    
    .glow-effect {
      position: absolute;
      width: 140rpx;
      height: 140rpx;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255, 105, 180, 0.4), transparent);
      animation: pulse-glow 2s ease-in-out infinite;
      z-index: 1;
    }
    
    .badge {
      position: absolute;
      top: -8rpx;
      right: -8rpx;
      background: linear-gradient(135deg, #ff6b8b, #ff4d6d);
      color: #fff;
      font-size: 22rpx;
      min-width: 40rpx;
      height: 40rpx;
      border-radius: 40rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 8rpx;
      border: 2rpx solid #fff;
      font-weight: bold;
      z-index: 3;
      box-shadow: 0 4rpx 12rpx rgba(255, 77, 109, 0.4);
      animation: bounce 0.5s ease-out;
    }
  }
  
  &.pulse-animation .avatar-wrapper {
    animation: float 3s ease-in-out infinite, pulse-scale 0.8s ease-in-out infinite;
  }
  
	.reminder-bubble {
		position: absolute;
		bottom: 150rpx;
		right: 20rpx;
		z-index: 1001;
		width: 400rpx;
		max-width: 420rpx;
		padding: 20rpx 26rpx;
		
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(12px);
		border-radius: 24rpx;
		box-shadow: 0 12rpx 30rpx rgba(0, 0, 0, 0.08);
		
		border: 1rpx solid rgba(255, 105, 180, 0.15);

		animation: bubbleIn 0.25s ease-out;

		display: flex;
		align-items: flex-start;
		gap: 12rpx;

		.bubble-icon {
			font-size: 30rpx;
			flex-shrink: 0;
			margin-top: 2rpx;
		}

		.bubble-text {
			font-size: 26rpx;
			color: #555;
			line-height: 1.4;

			/* ⭐关键：最多两行 */
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;

			overflow: hidden;
			word-break: break-word;
		}

		/* 小尾巴 */
		&::after {
			content: '';
			position: absolute;
			bottom: -10rpx;
			right: 40rpx;

			width: 20rpx;
			height: 20rpx;
			background: #fff;

			transform: rotate(45deg);
			box-shadow: 2rpx 2rpx 6rpx rgba(0,0,0,0.05);
		}
	}
}

// 聊天抽屉弹窗
.chat-drawer-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(12px);
  z-index: 2000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  
  .chat-drawer {
		margin:0 auto;
    width: 90%;
    height: 75vh;
    background: rgba(255, 255, 255, 0.96);
    backdrop-filter: blur(20px);
    border-radius: 48rpx 48rpx 0 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 -20rpx 60rpx rgba(255, 105, 180, 0.15);
    
    .drawer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 30rpx 30rpx 20rpx;
      background: linear-gradient(135deg, rgba(255, 240, 245, 0.95), rgba(255, 255, 255, 0.95));
      border-bottom: 1px solid rgba(255, 105, 180, 0.15);
      
      .header-info {
        display: flex;
        align-items: center;
        gap: 20rpx;
        
        .avatar-container {
          position: relative;
          
          .header-avatar {
            width: 88rpx;
            height: 88rpx;
            border-radius: 50%;
            border: 2rpx solid #ff88b0;
            box-shadow: 0 8rpx 20rpx rgba(255, 105, 180, 0.2);
          }
          
          .online-dot {
            position: absolute;
            bottom: 4rpx;
            right: 4rpx;
            width: 16rpx;
            height: 16rpx;
            background: #4caf50;
            border-radius: 50%;
            border: 2rpx solid #fff;
            animation: pulse-dot 1.5s ease-in-out infinite;
          }
        }
        
        .header-text {
          display: flex;
          flex-direction: column;
          gap: 6rpx;
          
          .header-name {
            font-size: 34rpx;
            font-weight: bold;
            background: linear-gradient(135deg, #ff69b4, #ff88b0);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }
          
          .header-status {
            font-size: 22rpx;
            color: #c9a9c9;
          }
        }
      }
      
      .close-btn {
        width: 64rpx;
        height: 64rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 105, 180, 0.1);
        border-radius: 50%;
        transition: all 0.2s;
        
        &:active {
          background: rgba(255, 105, 180, 0.2);
          transform: scale(0.95);
        }
      }
    }
    
    .chat-messages {
      flex: 1;
      padding: 20rpx;
      overflow-y: auto;
      
      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60rpx 0;
        
        .loading-dots {
          display: flex;
          gap: 12rpx;
          margin-bottom: 20rpx;
          
          .dot {
            width: 12rpx;
            height: 12rpx;
            background: linear-gradient(135deg, #ff69b4, #ff88b0);
            border-radius: 50%;
            animation: loading-bounce 1.4s ease-in-out infinite;
            
            &:nth-child(1) { animation-delay: -0.32s; }
            &:nth-child(2) { animation-delay: -0.16s; }
          }
        }
        
        .loading-text {
          font-size: 24rpx;
          color: #c9a9c9;
        }
      }
      
      .message-item {
        display: flex;
        margin-bottom: 25rpx;
        align-items: flex-start;
        
        &.user {
          justify-content: flex-end;
					padding: 0 44rpx 0 0;
          
          .message-wrapper {
            order: 2;
            margin-right: 0;
            margin-left: 16rpx;
          }
          
          .avatar-circle.user {
            order: 3;
          }
        }
        
        .avatar-circle {
          flex-shrink: 0;
          
          .msg-avatar {
            width: 72rpx;
            height: 72rpx;
            border-radius: 50%;
            
            &.user-avatar {
							margin-left: 10rpx;
              background: linear-gradient(135deg, #ffb6c1, #ffd0e0);
              border: 2rpx solid #fff;
            }
          }
        }
        
        .message-wrapper {
          max-width: 73%;
          
          .msg-bubble {
            padding: 15rpx 20rpx;
            border-radius: 20rpx;
            position: relative;
            
            &.assistant {
              background: rgba(255, 255, 255, 0.9);
              backdrop-filter: blur(8px);
              border: 1px solid rgba(255, 105, 180, 0.2);
              border-radius: 28rpx 28rpx 28rpx 12rpx;
              box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
              
              .msg-content {
                color: #5a5a7a;
                font-size: 26rpx;
                line-height: 1.5;
              }
            }
            
            &.user {
              background: linear-gradient(135deg, #ff88b0, #ff69b4);
              border-radius: 28rpx 28rpx 12rpx 28rpx;
              box-shadow: 0 4rpx 16rpx rgba(255, 105, 180, 0.2);
              
              .msg-content {
                color: #fff;
                font-size: 26rpx;
                line-height: 1.5;
								
								word-break: break-all;      /* 1. 允许在任意字符间（包括数字、字母中间）切断换行 */
								white-space: pre-wrap;      /* 2. 保留空格和换行符，同时允许自动折行 */
								overflow-wrap: break-word;  /* 3. 兼容写法，防止长单词溢出 */
              }
            }
          }
					.msg-time {
					  display: block;
					  font-size: 20rpx;
					  margin-top: 8rpx;
					  opacity: 0.6;
					  
					  &.assistant{
					    color: #c9a9c9;
					  }
					  
					  &.user{
					    color: rgba(255, 255, 255, 0.8);
					  }
					}
        }
        
        &.typing {
          .typing-bubble {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(8px);
            border-radius: 28rpx 28rpx 28rpx 12rpx;
            padding: 20rpx 28rpx;
            display: flex;
            align-items: center;
            gap: 12rpx;
            border: 1px solid rgba(255, 105, 180, 0.2);
            
            .typing-dots {
              display: flex;
              gap: 6rpx;
              
              .typing-dot {
                width: 8rpx;
                height: 8rpx;
                background: #ff69b4;
                border-radius: 50%;
                animation: typing-wave 1.2s ease-in-out infinite;
                
                &:nth-child(1) { animation-delay: -0.32s; }
                &:nth-child(2) { animation-delay: -0.16s; }
              }
            }
            
            .typing-text {
              font-size: 24rpx;
              color: #c9a9c9;
            }
          }
        }
      }
    }
    
    .quick-replies {
      padding: 16rpx 30rpx;
      background: rgba(255, 255, 255, 0.8);
      border-top: 1px solid rgba(255, 105, 180, 0.1);
      
      .quick-scroll {
        white-space: nowrap;
        
        .quick-reply-item {
          display: inline-block;
          padding: 14rpx 28rpx;
          margin-right: 16rpx;
          background: rgba(255, 105, 180, 0.08);
          border-radius: 60rpx;
          font-size: 26rpx;
          color: #ff88b0;
          transition: all 0.2s;
          border: 1px solid rgba(255, 105, 180, 0.2);
          
          &:active {
            background: rgba(255, 105, 180, 0.2);
            transform: scale(0.96);
          }
        }
      }
    }
    
    .chat-input-area {
      display: flex;
      padding: 20rpx 30rpx 30rpx;
      background: rgba(255, 255, 255, 0.95);
      gap: 16rpx;
      border-top: 1px solid rgba(255, 105, 180, 0.1);
      
      .input-wrapper {
        flex: 1;
        display: flex;
        align-items: center;
        background: rgba(248, 248, 252, 0.8);
        border-radius: 60rpx;
        border: 1px solid rgba(255, 105, 180, 0.2);
        transition: all 0.2s;
        
        &:focus-within {
          border-color: #ff88b0;
          background: #fff;
          box-shadow: 0 0 0 4rpx rgba(255, 105, 180, 0.1);
        }
        
        .chat-input {
          flex: 1;
          padding: 22rpx 20rpx;
          font-size: 28rpx;
          background: transparent;
        }
        
        .input-actions {
          display: flex;
          gap: 12rpx;
          padding-right: 20rpx;
          
          .action-icon {
            width: 56rpx;
            height: 56rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s;
            
            &:active {
              background: rgba(255, 105, 180, 0.1);
              transform: scale(0.92);
            }
          }
        }
      }
      
      .send-btn {
        width: 80rpx;
        height: 80rpx;
        background: #e0d0e0;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        
        &.active {
          background: linear-gradient(135deg, #ff69b4, #ff88b0);
          box-shadow: 0 6rpx 16rpx rgba(255, 105, 180, 0.4);
          
          &:active {
            transform: scale(0.94);
          }
        }
      }
    }
  }
}

// 动画定义
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12rpx); }
}

@keyframes breathing {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

@keyframes pulse-scale {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

@keyframes bounce {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

@keyframes loading-bounce {
  0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

@keyframes typing-wave {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-8rpx); }
}

@keyframes bubbleIn {
  from {
    opacity: 0;
    transform: translateY(20rpx) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

// 过渡动画
.bubble-fade-enter-active,
.bubble-fade-leave-active {
  transition: all 0.3s ease;
}

.bubble-fade-enter-from,
.bubble-fade-leave-to {
  opacity: 0;
  transform: translateY(20rpx);
}

.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.3s ease;
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateY(100%);
}

.message-fade-enter-active {
  animation: messageSlideIn 0.3s ease-out;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.typing-fade-enter-active,
.typing-fade-leave-active {
  transition: all 0.2s ease;
}

.typing-fade-enter-from,
.typing-fade-leave-to {
  opacity: 0;
  transform: translateY(10rpx);
}
</style>