<template>
  <view class="home-page">
    <!-- 顶部欢迎语 -->
    <view class="welcome-section">
      <text class="date">{{ currentDate }}</text>
    </view>
    
    <!-- 当前状态卡片 - 磨砂玻璃效果 -->
    <view class="status-card glass-card">
      <view class="baby-info">
        <image 
          :src="babyInfo.avatar" 
          class="avatar"
          mode="aspectFill"
          @click="goToProfile"
        ></image>
        <view class="info-text">
          <text class="name">{{ babyInfo.name }}</text>
          <text class="detail">{{ babyInfo.age }} · {{ babyInfo.gender }}</text>
        </view>
        <view class="status-tag" :class="sleepStatus.isSleeping ? 'sleep' : 'awake'">
          {{ sleepStatus.text }}
        </view>
      </view>
      
      <view class="sensor-grid">
        <view 
          class="sensor-item" 
          v-for="sensor in sensors" 
          :key="sensor.label"
          @click="goToMonitor"
        >
          <text class="label">{{ sensor.label }}</text>
          <text class="value" :style="{ color: getSensorColor(sensor.label) }">
            {{ formatSensorValue(sensor) }}
          </text>
        </view>
      </view>
    </view>
    
    <!-- 最近睡眠记录 -->
    <view class="section-title">
      <text>最近睡眠</text>
      <text class="more" @click="goToReport">查看全部 <uni-icons type="arrowright" size="14" color="#87cefa"></uni-icons></text>
    </view>
    
    <view class="records-list">
      <view 
        class="record-item glass-card" 
        v-for="record in recentSleep" 
        :key="record.date"
      >
        <view class="record-header">
          <view class="record-date">
            <uni-icons type="calendar" size="16" color="#ff69b4"></uni-icons>
            <text>{{ record.date }}</text>
          </view>
          <view 
            class="quality-tag" 
            :class="record.quality > 80 ? 'good' : 'warning'"
          >
            <uni-icons :type="record.quality > 80 ? 'checkmarkempty' : 'info'" size="14" color="#fff"></uni-icons>
            {{ record.quality > 80 ? '良好' : '注意' }}
          </view>
        </view>
        
        <view class="progress-bar">
          <view 
            class="progress-fill" 
            :style="{ 
              width: record.quality + '%',
              backgroundColor: record.quality > 80 ? '#ff69b4' : '#87cefa'
            }"
          ></view>
        </view>
        
        <view class="record-detail">
          <text>
            <uni-icons type="smallcircle-filled" size="14" color="#999" style="display: inline-block;"></uni-icons>
            深睡 {{ record.deepSleep }}h
          </text>
          <text>
            <uni-icons type="eye" size="14" color="#999" style="display: inline-block;"></uni-icons>
            夜醒 {{ record.wakeCount }}次
          </text>
        </view>
      </view>
    </view>
    
    <!-- 智能提示 - 增强视觉 -->
    <view class="smart-tip" @click="goToAnalysis">
      <view class="tip-icon">
        <uni-icons type="info" size="24" color="#ff69b4"></uni-icons>
      </view>
      <view class="tip-content">
        <text>{{ smartTip }}</text>
      </view>
      <uni-icons type="arrowright" size="20" color="#ff69b4"></uni-icons>
    </view>
		
		<Chat ref="chatComponent" />
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { 
  getBabyInfo, 
  getSleepStatus, 
  getSensors, 
  getRecentSleep, 
  getSmartTip,
} from '@/api/home'
import { updateDate } from '../../utils/date.js'
// 添加聊天组件导入
import Chat from '@/components/chat.vue'

// ==================== 响应式数据 ====================
const currentDate = ref('')
const babyInfo = ref({ name: '', age: '', gender: '', avatar: '' })
const sleepStatus = ref({ text: '', isSleeping: true })
const sensors = ref([])
const recentSleep = ref([])
const smartTip = ref('')

// 加载状态
const loading = ref({
  babyInfo: false,
  sleepStatus: false,
  sensors: false,
  recentSleep: false,
  smartTip: false
})

// 添加聊天组件引用
const chatComponent = ref(null)

// 添加自动提醒定时器
let reminderInterval = null

// ==================== 前端映射函数 ====================

// 传感器颜色映射
const getSensorColor = (label) => {
  const colorMap = {
    '环境温度': '#ff69b4',
    '心率': '#87cefa',
    '呼吸': '#ffb6c1',
    '环境湿度': '#98d8c8'
  }
  return colorMap[label] || '#ff69b4'
}

// 格式化传感器值
const formatSensorValue = (sensor) => {
  return `${sensor.value}${sensor.unit}`
}

// ==================== 数据加载函数 ====================

// 加载宝宝信息
const loadBabyInfo = async () => {
  loading.value.babyInfo = true
  try {
    const res = await getBabyInfo()
    if (res.code === 200) {
      babyInfo.value = res.data
			if (chatComponent.value) {
				chatComponent.value.updateChatData({ babyInfo: babyInfo.value })
			}
    }
  } catch (error) {
    console.error('获取宝宝信息失败:', error)
    uni.showToast({ title: '获取宝宝信息失败', icon: 'none' })
  } finally {
    loading.value.babyInfo = false
  }
}

// 加载睡眠状态
const loadSleepStatus = async () => {
  loading.value.sleepStatus = true
  try {
    const res = await getSleepStatus()
    if (res.code === 200) {
      sleepStatus.value = res.data
			if (chatComponent.value) {
				chatComponent.value.updateChatData({ sleepStatus: sleepStatus.value })
			}
    }
  } catch (error) {
    console.error('获取睡眠状态失败:', error)
  } finally {
    loading.value.sleepStatus = false
  }
}

// 加载传感器数据
const loadSensors = async () => {
  loading.value.sensors = true
  try {
    const res = await getSensors()
    if (res.code === 200) {
      sensors.value = res.data
			if (chatComponent.value) {
				chatComponent.value.updateChatData({ sensors: sensors.value })
			}
    }
  } catch (error) {
    console.error('获取传感器数据失败:', error)
    uni.showToast({ title: '获取传感器失败', icon: 'none' })
  } finally {
    loading.value.sensors = false
  }
}

// 加载最近睡眠记录
const loadRecentSleep = async () => {
  loading.value.recentSleep = true
  try {
    const res = await getRecentSleep()
    if (res.code === 200) {
      recentSleep.value = res.data
			if (chatComponent.value) {
				chatComponent.value.updateChatData({ recentSleep: recentSleep.value })
			}
    }
  } catch (error) {
    console.error('获取睡眠记录失败:', error)
    uni.showToast({ title: '获取睡眠记录失败', icon: 'none' })
  } finally {
    loading.value.recentSleep = false
  }
}

// 加载智能提示
const loadSmartTip = async () => {
  loading.value.smartTip = true
  try {
    const res = await getSmartTip()
    if (res.code === 200) {
      smartTip.value = res.data.content
    }
  } catch (error) {
    console.error('获取智能提示失败:', error)
  } finally {
    loading.value.smartTip = false
  }
}

// 加载所有数据（并行加载）
const loadAllData = async () => {
  uni.showLoading({ title: '加载中...' })
  
  try {
    await Promise.all([
      loadBabyInfo(),
      loadSleepStatus(),
      loadSensors(),
      loadRecentSleep(),
      loadSmartTip()
    ])
    
    uni.hideLoading()
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '加载失败', icon: 'none' })
    console.error('加载所有数据失败:', error)
  }
}

// ==================== 页面跳转方法 ====================
const goToProfile = () => {
  uni.switchTab({ url: '/pages/profile/profile' })
}

const goToMonitor = () => {
  uni.switchTab({ url: '/pages/monitor/monitor' })
}

const goToReport = () => {
  uni.switchTab({ url: '/pages/report/report' })
}

const goToAnalysis = () => {
  uni.switchTab({ url: '/pages/analysis/analysis' })
}

// ==================== 生命周期 ====================
// 修改生命周期，添加提醒定时器
onMounted(() => {
  currentDate.value = updateDate()
  loadAllData()
  
  // 定时更新传感器数据（保持不变）
  setInterval(() => {
    loadSensors()
    loadSleepStatus()
  }, 30000)
  
  // 添加：自动提醒定时器（每90秒触发一次）
  reminderInterval = setInterval(() => {
    if (chatComponent.value) {
      chatComponent.value.showReminder()
    }
  }, 90000)
})

// 添加：组件卸载时清除定时器
onUnmounted(() => {
  if (reminderInterval) clearInterval(reminderInterval)
})
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 90vh;
  padding: 40rpx 30rpx;
  background: linear-gradient(135deg, #f0f8ff 0%, #fff0f5 100%);
  
  // 磨砂玻璃卡片通用样式
  .glass-card {
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.6);
    box-shadow: 0 20rpx 40rpx -10rpx rgba(255, 105, 180, 0.15);
  }

  .welcome-section {
    margin-bottom: 20rpx;
    padding-left: 10rpx;    
		padding:30rpx;
		border-radius: 40rpx;
		background: linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(250, 245, 245, 0.85));
		box-shadow: 
		    0 10px 30px -10px rgba(0, 20, 30, 0.15),
		    inset 0 1px 2px rgba(255, 255, 255, 0.8);
		border: 1px solid rgba(255, 255, 255, 0.6);
    .date {
      display: block;
      font-size: 32rpx;
      color: rgba(240, 205, 205);
      font-weight: 450;
    }
  }

  .status-card {
    border-radius: 40rpx;
    padding: 30rpx 30rpx 20rpx;
    margin-bottom: 40rpx;

    .baby-info {
      display: flex;
      align-items: center;
      margin-bottom: 40rpx;
      
      .avatar {
        width: 120rpx;
        height: 120rpx;
        border-radius: 50%;
        background: linear-gradient(145deg, #ffb6c1, #ffd0e0);
        border: 4rpx solid rgba(255, 255, 255, 0.8);
        box-shadow: 0 10rpx 30rpx rgba(255, 105, 180, 0.2);
      }
      
      .info-text {
        flex: 1;
        margin-left: 30rpx;
        
        .name {
          display: block;
          font-size: 40rpx;
          font-weight: bold;
          color: #4a4a6a;
          margin-bottom: 8rpx;
          letter-spacing: 1rpx;
        }
        
        .detail {
          display: block;
          font-size: 26rpx;
          color: #8a8aa8;
        }
      }
      
      .status-tag {
        display: flex;
        align-items: center;
        gap: 8rpx;
        padding: 12rpx 28rpx;
        border-radius: 50rpx;
        font-size: 26rpx;
        font-weight: 500;
        background: rgba(255, 255, 255, 0.6);
        backdrop-filter: blur(4px);
        box-shadow: 0 6rpx 16rpx rgba(76, 175, 80, 0.15);
        
        &.sleep {
          background: linear-gradient(145deg, #e8f5e9, #d4edda);
          color: #4caf50;
          border: 1px solid rgba(76, 175, 80, 0.2);
        }
        
        &.awake {
          background: linear-gradient(145deg, #fff3e0, #ffe0b2);
          color: #ff9800;
          border: 1px solid rgba(255, 152, 0, 0.2);
        }
      }
    }

    .sensor-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10rpx;
      padding: 10rpx 0;
      
      .sensor-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8rpx;
        padding: 20rpx 0;
        border-radius: 30rpx;
        transition: all 0.2s;
        
        &:active {
          background: rgba(255, 255, 255, 0.5);
          transform: scale(0.95);
        }
        
        .uni-icons {
          margin-bottom: 8rpx;
          filter: drop-shadow(0 4rpx 8rpx rgba(255, 105, 180, 0.2));
        }
        
        .label {
          font-size: 24rpx;
          color: #8a8aa8;
          font-weight: 450;
        }
        
        .value {
          font-size: 30rpx;
          font-weight: bold;
          text-shadow: 0 2rpx 6rpx rgba(255, 255, 255, 0.8);
        }
      }
    }
  }

  .section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
    padding: 0 10rpx;
    
    text:first-child {
      font-size: 36rpx;
      font-weight: bold;
      color: #4a4a6a;
      letter-spacing: 1rpx;
    }
    
    .more {
      display: flex;
      align-items: center;
      gap: 4rpx;
      font-size: 26rpx;
      color: #87cefa;
      font-weight: normal;
      padding: 8rpx 16rpx;
      border-radius: 40rpx;
      background: rgba(135, 206, 250, 0.1);
    }
  }

  .records-list {
    margin-bottom: 40rpx;
    
    .record-item {
      border-radius: 30rpx;
      padding: 30rpx;
      margin-bottom: 20rpx;
      transition: all 0.2s;
      
      &:active {
        transform: translateY(-4rpx);
        box-shadow: 0 30rpx 50rpx -20rpx rgba(255, 105, 180, 0.3);
      }
      
      .record-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24rpx;
        
        .record-date {
          display: flex;
          align-items: center;
          gap: 10rpx;
          font-size: 30rpx;
          font-weight: bold;
          color: #4a4a6a;
          
          .uni-icons {
            filter: drop-shadow(0 2rpx 6rpx rgba(255, 105, 180, 0.3));
          }
        }
        
        .quality-tag {
          display: flex;
          align-items: center;
          gap: 6rpx;
          padding: 6rpx 20rpx;
          border-radius: 40rpx;
          font-size: 24rpx;
          font-weight: 500;
          box-shadow: 0 6rpx 14rpx rgba(0,0,0,0.1);
          
          &.good {
            background: linear-gradient(145deg, #ff69b4, #ff88b0);
            color: #fff;
          }
          
          &.warning {
            background: linear-gradient(145deg, #87cefa, #7bb9e2);
            color: #fff;
          }
        }
      }
      
      .progress-bar {
        width: 100%;
        height: 16rpx;
        background: rgba(200, 200, 230, 0.3);
        border-radius: 40rpx;
				margin-bottom: 20rpx;
        overflow: hidden;
        backdrop-filter: blur(2px);
        
        .progress-fill {
          height: 100%;
          border-radius: 40rpx;
          transition: width 0.5s ease;
          box-shadow: 0 0 20rpx currentColor;
        }
      }
      
      .record-detail {
        display: flex;
        justify-content: space-between;
        font-size: 26rpx;
        color: #8a8aa8;
        
        text {
          display: flex;
          align-items: center;
          gap: 6rpx;
        }
      }
    }
  }

  .smart-tip {
    display: flex;
    align-items: center;
    background: linear-gradient(145deg, rgba(255, 240, 245, 0.8), rgba(255, 220, 235, 0.8));
    backdrop-filter: blur(10px);
    border-radius: 40rpx;
    padding: 30rpx 30rpx 30rpx;
    border: 1px solid rgba(255, 105, 180, 0.3);
    box-shadow: 0 20rpx 40rpx -10rpx rgba(255, 105, 180, 0.2);
    
    .tip-icon {
      margin-right: 20rpx;
    }
    
    .tip-content {
      flex: 1;
      font-size: 28rpx;
      color: #ff69b4;
      font-weight: 450;
      text-shadow: 0 2rpx 6rpx rgba(255, 255, 255, 0.8);
    }
    
    .uni-icons:last-child {
      margin-left: 20rpx;
      opacity: 0.7;
    }
  }
}
</style>