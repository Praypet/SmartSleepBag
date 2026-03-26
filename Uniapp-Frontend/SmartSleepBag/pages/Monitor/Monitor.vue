<template>
  <view class="monitor-page">
    <!-- 合并后的环境参数大卡片 -->
    <view class="env-card glass-card">
      <view class="env-title">
        <uni-icons type="thermometer" size="22" color="#ff69b4"></uni-icons>
        <text>环境监测</text>
      </view>
      
      <view class="env-list">
        <view 
          class="env-item" 
          v-for="sensor in sensors" 
          :key="sensor.name"
        >
          <view class="env-item-left">
            <text class="env-item-name">{{ sensor.name }}</text>
          </view>
          <view class="env-item-right">
            <text class="env-item-value" :style="{ color: getSensorColor(sensor.name) }">
              {{ sensor.value }}{{ sensor.unit }}
            </text>
            <view 
              class="env-item-status" 
              :style="{ 
                backgroundColor: getSensorColor(sensor.name) + '20',
                color: getSensorColor(sensor.name) 
              }"
            >
              {{ sensor.status }}
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 心率波形图 -->
    <view class="chart-card glass-card">
      <view class="card-header">
        <view class="card-title">
          <uni-icons type="heart-filled" size="22" color="#ff69b4"></uni-icons>
          <text>心率波形</text>
        </view>
        <text class="live-badge">实时</text>
      </view>
      <view class="wave-container">
        <view 
          class="wave-bar" 
          v-for="(value, index) in heartRateData" 
          :key="index"
          :style="{ height: value + '%' }"
        ></view>
      </view>
    </view>

    <!-- 哭声分析 -->
    <view class="analysis-card glass-card">
      <view class="card-header">
        <view class="card-title">
          <uni-icons type="sound" size="22" color="#ff69b4"></uni-icons>
          <text>哭声分析</text>
        </view>
      </view>

      <view class="cry-status">
        <text class="status-label">当前哭声识别</text>
        <view class="status-badge" :class="crying ? 'crying' : 'quiet'">
          {{ crying ? '检测到哭声' : '安静' }}
        </view>
      </view>

      <view v-if="crying" class="cry-analysis">
        <view class="cry-types">
          <view class="type-tags">
            <text class="cry-label">可能原因：</text>
            <view 
              v-for="reason in possibleReasons" 
              :key="reason"
              class="type-tag" 
              :style="{ background: getReasonColor(reason) }"
            >
              {{ reason }}
            </view>
          </view>
        </view>

        <view class="probability-list">
          <view class="prob-item" v-for="item in probabilities" :key="item.name">
            <view class="prob-label">
              <text>{{ item.name }}</text>
              <text>{{ item.probability }}%</text>
            </view>
            <view class="prob-bar">
              <view 
                class="prob-fill" 
                :style="{ 
                  width: item.probability + '%',
                  backgroundColor: getReasonColor(item.name)
                }"
              ></view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 体温变化 -->
    <view class="temp-chart-card glass-card">
      <view class="card-header">
        <view class="card-title">
          <uni-icons type="thermometer" size="22" color="#ff69b4"></uni-icons>
          <text>体温变化</text>
        </view>
      </view>

      <view class="line-chart">
        <view 
          v-for="(temp, index) in tempData" 
          :key="index"
          class="chart-point"
          :style="{
            left: (index / (tempData.length - 1) * 100) + '%',
            bottom: ((temp - 36) / 1.5 * 100) + '%'
          }"
        >
          <view class="point-dot"></view>
          <text class="point-label">{{ temp }}°C</text>
        </view>
        <view class="chart-line"></view>
      </view>

      <view class="time-axis">
        <text v-for="time in timeLabels" :key="time">{{ time }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { 
  getSensorData, 
  getHeartRateData, 
  getCryAnalysis, 
  getTempData, 
} from '@/api/monitor'

// 响应式数据
const isMonitoring = ref(true)
const sensors = ref([])
const heartRateData = ref([])
const crying = ref(false)
const possibleReasons = ref([])
const probabilities = ref([])
const tempData = ref([])
const timeLabels = ref([])

// 定时器
let heartRateTimer = null
let sensorsTimer = null

// 前端颜色判断函数
const getSensorColor = (sensorName) => {
  const colorMap = {
    '环境温度': '#ff69b4',
    '心率': '#87cefa',
    '呼吸': '#ffb6c1',
    '环境湿度': '#98d8c8'
  }
  return colorMap[sensorName] || '#ff69b4'
}

const getReasonColor = (reason) => {
  const colorMap = {
    '饥饿': '#ff69b4',
    '尿湿': '#87cefa',
    '疼痛': '#98d8c8'
  }
  return colorMap[reason] || '#ff69b4'
}

// 加载传感器数据
const loadSensorData = async () => {
  try {
    const res = await getSensorData()
    if (res.code === 200) {
      sensors.value = res.data
    }
  } catch (error) {
    console.error('获取传感器数据失败:', error)
  }
}

// 加载心率数据
const loadHeartRateData = async () => {
  try {
    const res = await getHeartRateData()
    if (res.code === 200) {
      heartRateData.value = res.data
    }
  } catch (error) {
    console.error('获取心率数据失败:', error)
  }
}

// 加载哭声分析数据
const loadCryAnalysis = async () => {
  try {
    const res = await getCryAnalysis()
    if (res.code === 200) {
      crying.value = res.data.isCrying
      possibleReasons.value = res.data.possibleReasons
      probabilities.value = res.data.probabilities
    }
  } catch (error) {
    console.error('获取哭声分析失败:', error)
  }
}

// 加载体温数据
const loadTempData = async () => {
  try {
    const res = await getTempData()
    if (res.code === 200) {
      tempData.value = res.data.temperatures
      timeLabels.value = res.data.timeLabels
    }
  } catch (error) {
    console.error('获取体温数据失败:', error)
  }
}

// 启动实时监测
const startMonitoring = () => {
  // 心率数据实时更新（每2秒）
  heartRateTimer = setInterval(async () => {
    await loadHeartRateData()
  }, 2000)
  
  // 传感器数据更新（每10秒）
  sensorsTimer = setInterval(async () => {
    await loadSensorData()
  }, 10000)
}

// 停止监测
const stopMonitoring = () => {
  if (heartRateTimer) {
    clearInterval(heartRateTimer)
    heartRateTimer = null
  }
  if (sensorsTimer) {
    clearInterval(sensorsTimer)
    sensorsTimer = null
  }
}

// 初始化数据
const initData = async () => {  
  // 方式一：分模块加载（取消注释使用）
  await Promise.all([
    loadSensorData(),
    loadHeartRateData(),
    loadCryAnalysis(),
    loadTempData()
  ])
  
  // 启动实时监测
  startMonitoring()
}

// 生命周期
onMounted(() => {
  initData()
})

onUnmounted(() => {
  stopMonitoring()
})
</script>

<style lang="scss" scoped>
.monitor-page {
  min-height: 100vh;
  padding: 30rpx;
  background: linear-gradient(135deg, #f0f8ff 0%, #fff0f5 100%);

  // 磨砂玻璃卡片通用样式
  .glass-card {
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.6);
    box-shadow: 0 20rpx 40rpx -10rpx rgba(255, 105, 180, 0.15);
    border-radius: 32rpx;
    padding: 30rpx;
    margin-bottom: 30rpx;
  }

  // 卡片头部通用样式
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
    
    .card-title {
      display: flex;
      align-items: center;
      gap: 12rpx;
      font-size: 32rpx;
      font-weight: bold;
      color: #4a4a6a;
    }
  }

  // 环境监测大卡片
  .env-card {
    .env-title {
      display: flex;
      align-items: center;
      gap: 12rpx;
      font-size: 32rpx;
      font-weight: bold;
      color: #4a4a6a;
      margin-bottom: 30rpx;
      padding-bottom: 20rpx;
      border-bottom: 2rpx dashed #e2c7da;
    }

    .env-list {
      display: flex;
      flex-direction: column;
      gap: 24rpx;

      .env-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10rpx 0;

        .env-item-left {
          padding-left: 10rpx;
          display: flex;
          align-items: center;
          gap: 16rpx;

          .env-item-name {
            font-size: 28rpx;
            color: #5e5e7e;
            font-weight: 450;
          }
        }

        .env-item-right {
          display: flex;
          align-items: center;
          gap: 20rpx;

          .env-item-value {
            font-size: 32rpx;
            font-weight: bold;
            min-width: 90rpx;
            text-align: right;
          }

          .env-item-status {
            font-size: 24rpx;
            padding: 6rpx 20rpx;
            border-radius: 40rpx;
            font-weight: 450;
            min-width: 70rpx;
            text-align: center;
          }
        }
      }
    }
  }

  // 心率波形图
  .chart-card {
    .live-badge {
      padding: 4rpx 16rpx;
      background: linear-gradient(145deg, #ff9acb, #ff69b4);
      color: #fff;
      font-size: 24rpx;
      border-radius: 30rpx;
      box-shadow: 0 4rpx 12rpx #ff69b480;
    }
    
    .wave-container {
      display: flex;
      align-items: flex-end;
      height: 200rpx;
      gap: 4rpx;
      
      .wave-bar {
        flex: 1;
        background: linear-gradient(to top, #87cefa, #ff69b4);
        border-radius: 12rpx 12rpx 6rpx 6rpx;
        transition: height 0.3s;
        box-shadow: 0 -2rpx 8rpx #ffb3d9aa;
      }
    }
  }

  // 体温变化图表
  .temp-chart-card {
    .line-chart {
      position: relative;
      height: 300rpx;
      margin: 40rpx 0 20rpx;
      border-bottom: 2rpx dashed #e2c7da;
      
      .chart-line {
        position: absolute;
        bottom: 40rpx;
        left: 0;
        width: 100%;
        height: 4rpx;
        background: linear-gradient(90deg, #87cefa, #ff69b4);
      }
      
      .chart-point {
        position: absolute;
        transform: translateX(-50%);
        
        .point-dot {
          width: 18rpx;
          height: 18rpx;
          background: #ff69b4;
          border: 4rpx solid white;
          border-radius: 50%;
          margin-bottom: 4rpx;
          box-shadow: 0 4rpx 12rpx #ff69b4;
        }
        
        .point-label {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          font-size: 22rpx;
          color: #4f4f72;
          background: rgba(255, 240, 245, 0.8);
          padding: 4rpx 16rpx;
          border-radius: 40rpx;
          white-space: nowrap;
          margin-bottom: 12rpx;
          backdrop-filter: blur(4px);
        }
      }
    }
    
    .time-axis {
      display: flex;
      justify-content: space-between;
      margin-top: 20rpx;
      
      text {
        font-size: 22rpx;
        color: #7b7b9c;
      }
    }
  }

  // 哭声分析卡片
  .analysis-card {
    .cry-status {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30rpx;
      
      .status-label {
        font-size: 28rpx;
        color: #5e5e7e;
      }
      
      .status-badge {
        padding: 8rpx 24rpx;
        border-radius: 40rpx;
        font-size: 26rpx;
        font-weight: 500;
        
        &.crying {
          background: #ff4d6d;
          color: #fff;
          box-shadow: 0 6rpx 14rpx #ff4d6daa;
        }
        
        &.quiet {
          background: #4caf50;
          color: #fff;
          box-shadow: 0 6rpx 14rpx #4caf50aa;
        }
      }
    }
    
    .cry-types {
      margin-bottom: 30rpx;
      
      .cry-label {
        font-size: 28rpx;
        color: #6b6b8f;
        margin-right: 20rpx;
      }
      
      .type-tags {
        display: flex;
        align-items: center;
        gap: 20rpx;
        
        .type-tag {
          padding: 8rpx 32rpx;
          border-radius: 40rpx;
          color: #fff;
          font-size: 26rpx;
          font-weight: 500;
          box-shadow: 0 6rpx 12rpx currentColor;
        }
      }
    }
    
    .prob-item {
      margin-bottom: 24rpx;
      
      .prob-label {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8rpx;
        font-size: 26rpx;
        color: #5a5a7a;
      }
      
      .prob-bar {
        width: 100%;
        height: 16rpx;
        background: rgba(200, 200, 230, 0.3);
        border-radius: 40rpx;
        overflow: hidden;
        backdrop-filter: blur(2px);
        
        .prob-fill {
          height: 100%;
          border-radius: 40rpx;
          transition: width 0.3s;
          box-shadow: 0 0 10rpx currentColor;
        }
      }
    }
  }
}
</style>