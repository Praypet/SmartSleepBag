<template>
  <view class="analysis-page">
    <!-- 睡眠质量评分 -->
    <view class="quality-card glass-card">
      <view class="quality-header">
        <view class="quality-title">
          <uni-icons type="heart-filled" size="22" color="#ff69b4"></uni-icons>
          <text>睡眠质量评分</text>
        </view>
        <view class="score-wrapper">
          <text class="score">{{ qualityScore }}</text>
          <text class="score-unit">分</text>
        </view>
      </view>
      <view class="quality-tags">
        <view 
          v-for="(tag, index) in qualityTags" 
          :key="tag"
          class="tag" 
          :style="{ background: getTagGradient(index) }"
        >
          <uni-icons :type="getTagIcon(tag)" size="14" color="#fff"></uni-icons>
          <text>{{ tag }}</text>
        </view>
      </view>
    </view>
    
    <!-- 睡眠阶段分布 -->
    <view class="chart-card glass-card">
      <view class="card-header">
        <view class="card-title">
          <uni-icons type="pie" size="22" color="#ff69b4"></uni-icons>
          <text>睡眠阶段分布</text>
        </view>
        <text class="total-hours">总计 {{ totalHours }}h</text>
      </view>
      
      <!-- 环形图模拟 -->
      <view class="donut-chart">
        <view class="donut">
          <view 
            v-for="(stage, index) in sleepStages" 
            :key="stage.name"
            class="donut-segment"
            :style="{
              transform: `rotate(${getSegmentRotation(index)}deg)`,
              background: `conic-gradient(${getStageColor(stage.name)} 0deg ${getSegmentAngle(stage.hours)}deg, transparent 0deg)`
            }"
          ></view>
          <view class="donut-hole">
            <text class="donut-hole-text">{{ totalHours }}h</text>
          </view>
        </view>
      </view>
      
      <view class="stage-legend">
        <view v-for="stage in sleepStages" :key="stage.name" class="legend-item">
          <view class="color-dot" :style="{ backgroundColor: getStageColor(stage.name) }"></view>
          <text class="legend-name">{{ stage.name }}</text>
          <text class="legend-value">{{ stage.hours }}h</text>
          <text class="legend-percent">{{ getStagePercentage(stage.hours) }}%</text>
        </view>
      </view>
    </view>
    
    <!-- 夜醒分析 -->
    <view class="analysis-card glass-card">
      <view class="card-header">
        <view class="card-title">
          <uni-icons type="eye" size="22" color="#ff69b4"></uni-icons>
          <text>夜醒分析</text>
        </view>
      </view>
      
      <view class="wake-count">
        <text class="wake-label">总夜醒次数</text>
        <view class="wake-value">
          <text class="count-number">{{ wakeTotalCount }}</text>
          <text class="count-unit">次</text>
        </view>
      </view>
      
      <view class="reason-list">
        <view v-for="reason in wakeReasons" :key="reason.name" class="reason-item">
          <view class="reason-label">
            <view class="reason-name">
              <view class="reason-dot" :style="{ backgroundColor: getReasonColor(reason.name) }"></view>
              <text>{{ reason.name }}</text>
            </view>
            <text class="reason-percent">{{ reason.percentage }}%</text>
          </view>
          <view class="progress-bar">
            <view 
              class="progress-fill" 
              :style="{ 
                width: reason.percentage + '%',
                backgroundColor: getReasonColor(reason.name)
              }"
            ></view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 智能建议 -->
    <view class="advice-card glass-card">
      <view class="card-header">
        <view class="card-title">
          <uni-icons type="info" size="22" color="#ff69b4"></uni-icons>
          <text>智能建议</text>
        </view>
      </view>
      
      <view v-for="advice in advices" :key="advice.title" class="advice-item">
        <view class="advice-icon" :style="{ backgroundColor: getAdviceColor(advice.title) + '20' }">
          <uni-icons :type="getAdviceIcon(advice.title)" :color="getAdviceColor(advice.title)" size="24"></uni-icons>
        </view>
        <view class="advice-content">
          <text class="advice-title">{{ advice.title }}</text>
          <text class="advice-desc">{{ advice.content }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  getQualityScore, 
  getSleepStages, 
  getWakeAnalysis, 
  getAdvices
} from '@/api/analysis'

// 响应式数据
const qualityScore = ref(0)
const qualityTags = ref([])
const sleepStages = ref([])
const wakeTotalCount = ref(0)
const wakeReasons = ref([])
const advices = ref([])

// 加载状态
const loading = ref({
  quality: false,
  stages: false,
  wake: false,
  advices: false
})

// ==================== 前端颜色/图标映射函数 ====================

// 睡眠阶段颜色映射
const getStageColor = (stageName) => {
  const colorMap = {
    '深睡': '#ff69b4',
    '浅睡': '#87cefa',
    'REM': '#98d8c8',
    '清醒': '#ffb6c1'
  }
  return colorMap[stageName] || '#ff69b4'
}

// 标签图标映射
const getTagIcon = (tagText) => {
  const iconMap = {
    '深睡充足': 'moon',
    '夜醒较少': 'eye',
    '体温平稳': 'thermometer'
  }
  return iconMap[tagText] || 'info'
}

// 标签渐变样式
const getTagGradient = (index) => {
  const gradients = [
    'linear-gradient(145deg, #87cefa, #7bb9e2)',
    'linear-gradient(145deg, #ff69b4, #ff88b0)',
    'linear-gradient(145deg, #98d8c8, #7bc0b0)'
  ]
  return gradients[index % gradients.length]
}

// 夜醒原因颜色映射
const getReasonColor = (reasonName) => {
  const colorMap = {
    '尿湿': '#87cefa',
    '饥饿': '#ff69b4',
    '温度不适': '#98d8c8'
  }
  return colorMap[reasonName] || '#ff69b4'
}

// 建议图标映射
const getAdviceIcon = (title) => {
  const iconMap = {
    '睡眠环境': 'thermometer',
    '作息调整': 'moon',
    '注意事项': 'info'
  }
  return iconMap[title] || 'info'
}

// 建议颜色映射
const getAdviceColor = (title) => {
  const colorMap = {
    '睡眠环境': '#87cefa',
    '作息调整': '#ff69b4',
    '注意事项': '#98d8c8'
  }
  return colorMap[title] || '#ff69b4'
}

// ==================== 计算属性 ====================

// 计算总睡眠时间
const totalHours = computed(() => {
  const sum = sleepStages.value.reduce((sum, stage) => sum + stage.hours, 0)
  return Math.round(sum * 100) / 100 
})

// 获取阶段百分比
const getStagePercentage = (hours) => {
  if (totalHours.value === 0) return 0
  return Math.round((hours / totalHours.value) * 100)
}

// 计算环形图角度
const getSegmentAngle = (hours) => {
  if (totalHours.value === 0) return 0
  return (hours / totalHours.value) * 360
}

const getSegmentRotation = (index) => {
  let rotation = 0
  for (let i = 0; i < index; i++) {
    rotation += getSegmentAngle(sleepStages.value[i]?.hours || 0)
  }
  return rotation
}

// ==================== 数据加载函数 ====================

// 加载睡眠质量评分
const loadQualityScore = async () => {
  loading.value.quality = true
  try {
    const res = await getQualityScore()
    if (res.code === 200) {
      qualityScore.value = res.data.score
      qualityTags.value = res.data.tags
    }
  } catch (error) {
    console.error('获取质量评分失败:', error)
    uni.showToast({ title: '获取质量评分失败', icon: 'none' })
  } finally {
    loading.value.quality = false
  }
}

// 加载睡眠阶段
const loadSleepStages = async () => {
  loading.value.stages = true
  try {
    const res = await getSleepStages()
    if (res.code === 200) {
      sleepStages.value = res.data
    }
  } catch (error) {
    console.error('获取睡眠阶段失败:', error)
    uni.showToast({ title: '获取睡眠阶段失败', icon: 'none' })
  } finally {
    loading.value.stages = false
  }
}

// 加载夜醒分析
const loadWakeAnalysis = async () => {
  loading.value.wake = true
  try {
    const res = await getWakeAnalysis()
    if (res.code === 200) {
      wakeTotalCount.value = res.data.totalCount
      wakeReasons.value = res.data.reasons
    }
  } catch (error) {
    console.error('获取夜醒分析失败:', error)
    uni.showToast({ title: '获取夜醒分析失败', icon: 'none' })
  } finally {
    loading.value.wake = false
  }
}

// 加载智能建议
const loadAdvices = async () => {
  loading.value.advices = true
  try {
    const res = await getAdvices()
    if (res.code === 200) {
      advices.value = res.data
    }
  } catch (error) {
    console.error('获取智能建议失败:', error)
    uni.showToast({ title: '获取智能建议失败', icon: 'none' })
  } finally {
    loading.value.advices = false
  }
}

// 加载所有数据（并行加载）
const loadAllData = async () => {
  uni.showLoading({ title: '加载中...' })
  
  try {
    await Promise.all([
      loadQualityScore(),
      loadSleepStages(),
      loadWakeAnalysis(),
      loadAdvices()
    ])
    uni.hideLoading()
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '加载失败', icon: 'none' })
    console.error('加载所有数据失败:', error)
  }
}

// 初始化
onMounted(() => {
  loadAllData()
})
</script>

<style lang="scss" scoped>
.analysis-page {
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

  .quality-card {
    .quality-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30rpx;
      
      .quality-title {
        display: flex;
        align-items: center;
        gap: 12rpx;
        font-size: 32rpx;
        color: #5e5e7e;
      }
      
      .score-wrapper {
        display: flex;
        align-items: baseline;
        gap: 4rpx;
        
        .score {
          font-size: 64rpx;
          font-weight: bold;
          background: linear-gradient(145deg, #ff69b4, #ff9acb);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .score-unit {
          font-size: 28rpx;
          color: #8a8aa8;
        }
      }
    }
    
    .quality-tags {
      display: flex;
      gap: 20rpx;
      
      .tag {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8rpx;
        padding: 16rpx 0;
        border-radius: 60rpx;
        color: #fff;
        font-size: 24rpx;
        font-weight: 500;
        box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.1);
        
        .uni-icons {
          filter: drop-shadow(0 2rpx 4rpx rgba(0,0,0,0.1));
        }
      }
    }
  }

  .chart-card {
    .total-hours {
      font-size: 28rpx;
      color: #8a8aa8;
      background: rgba(255, 105, 180, 0.1);
      padding: 6rpx 20rpx;
      border-radius: 40rpx;
    }
    
    .donut-chart {
      display: flex;
      justify-content: center;
      margin: 20rpx 0 40rpx;
      
      .donut {
        position: relative;
        width: 400rpx;
        height: 400rpx;
        border-radius: 50%;
        overflow: hidden;
        box-shadow: 0 20rpx 40rpx -10rpx rgba(255, 105, 180, 0.3);
        
        .donut-segment {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        
        .donut-hole {
          position: absolute;
          top: 25%;
          left: 25%;
          width: 50%;
          height: 50%;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(4px);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          
          .donut-hole-text {
            font-size: 36rpx;
            font-weight: bold;
            color: #ff69b4;
          }
        }
      }
    }
    
    .stage-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 20rpx;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 30rpx;
      padding: 20rpx;
      
      .legend-item {
        flex: 1 1 calc(50% - 20rpx);
        display: flex;
        align-items: center;
        gap: 12rpx;
        padding: 10rpx 0;
        
        .color-dot {
          width: 24rpx;
          height: 24rpx;
          border-radius: 50%;
          box-shadow: 0 4rpx 10rpx currentColor;
        }
        
        .legend-name {
          font-size: 26rpx;
          color: #5e5e7e;
          flex: 1;
        }
        
        .legend-value {
          font-size: 26rpx;
          font-weight: bold;
          color: #4a4a6a;
        }
        
        .legend-percent {
          font-size: 22rpx;
          color: #8a8aa8;
          min-width: 50rpx;
          text-align: right;
        }
      }
    }
  }

  .analysis-card {
    .wake-count {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx 0;
      
      .wake-label {
        font-size: 30rpx;
        color: #5e5e7e;
      }
      
      .wake-value {
        display: flex;
        align-items: baseline;
        gap: 4rpx;
        
        .count-number {
          font-size: 24px;
          font-weight: bold;
          background: linear-gradient(145deg, #ff69b4, #ff9acb);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .count-unit {
          font-size: 28rpx;
          color: #8a8aa8;
        }
      }
    }
    
    .reason-item {
      margin-bottom: 24rpx;
      
      .reason-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12rpx;
        
        .reason-name {
          display: flex;
          align-items: center;
          gap: 12rpx;
          
          .reason-dot {
            width: 16rpx;
            height: 16rpx;
            border-radius: 50%;
            box-shadow: 0 2rpx 8rpx currentColor;
          }
          
          text {
            font-size: 28rpx;
            color: #5e5e7e;
          }
        }
        
        .reason-percent {
          font-size: 26rpx;
          font-weight: bold;
          color: #4a4a6a;
        }
      }
      
      .progress-bar {
        width: 100%;
        height: 16rpx;
        background: rgba(200, 200, 230, 0.3);
        border-radius: 40rpx;
        overflow: hidden;
        backdrop-filter: blur(2px);
        
        .progress-fill {
          height: 100%;
          border-radius: 40rpx;
          transition: width 0.3s;
          box-shadow: 0 0 20rpx currentColor;
        }
      }
    }
  }

  .advice-card {
    .advice-item {
      display: flex;
      align-items: center;
      margin-bottom: 30rpx;
      padding: 20rpx;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 28rpx;
      transition: all 0.2s;
      
      &:active {
        transform: translateX(10rpx);
        background: rgba(255, 255, 255, 0.8);
      }
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .advice-icon {
        width: 80rpx;
        height: 80rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        margin-right: 24rpx;
        
        .uni-icons {
          filter: drop-shadow(0 4rpx 8rpx rgba(0,0,0,0.1));
        }
      }
      
      .advice-content {
        flex: 1;
        
        .advice-title {
          display: block;
          font-size: 30rpx;
          font-weight: bold;
          color: #4a4a6a;
          margin-bottom: 8rpx;
        }
        
        .advice-desc {
          display: block;
          font-size: 26rpx;
          color: #8a8aa8;
          line-height: 1.5;
        }
      }
    }
  }
}
</style>