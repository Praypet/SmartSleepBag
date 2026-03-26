<template>
  <view class="report-page">
    <!-- 日期选择 -->
    <view class="date-selector glass-card" @click="openDatePicker">
      <text class="selector-label">报告周期</text>
      <view class="selected-date">
        <text>{{ dateRange.start + ' ~ ' + dateRange.end }}</text>
        <uni-icons type="arrowdown" size="16" color="#ff69b4"></uni-icons>
      </view>
    </view>
    
    <!-- 统计卡片 -->
    <view class="stats-grid">
      <view v-for="stat in statistics" :key="stat.label" class="stat-card glass-card">
        <text class="stat-label">{{ stat.label }}</text>
        <text class="stat-value" :style="{ color: getStatColor(stat.label) }">
          {{ formatStatValue(stat) }}
        </text>
        <view class="stat-trend" :style="{ color: getTrendColor(stat.trend) }">
          <uni-icons 
            :type="stat.trend > 0 ? 'arrowup' : 'arrowdown'" 
            size="14" 
            :color="getTrendColor(stat.trend)"
          ></uni-icons>
          <text>{{ Math.abs(stat.trend) }}% 较上周</text>
        </view>
      </view>
    </view>
    
    <!-- 睡眠趋势 -->
    <view class="chart-card glass-card">
      <view class="card-header">
        <view class="card-title">
          <uni-icons type="bars" size="22" color="#ff69b4"></uni-icons>
          <text>7天睡眠趋势</text>
        </view>
      </view>
      
      <view class="bar-chart">
        <view v-for="(day, index) in weeklyData" :key="day.day" class="bar-group">
          <view class="bars">
            <view 
              class="bar sleep-bar" 
              :style="{ height: (day.sleepDuration / 12 * 200) + 'rpx' }"
            >
              <text class="bar-label">{{ day.sleepDuration }}h</text>
            </view>
            <view 
              class="bar rem-bar" 
              :style="{ height: (day.remSleep / 12 * 200) + 'rpx' }"
            >
              <text class="bar-label">{{ day.remSleep }}h</text>
            </view>
          </view>
          <text class="day-label">{{ day.day }}</text>
        </view>
      </view>
      
      <view class="chart-legend">
        <view class="legend-item">
          <view class="legend-color sleep"></view>
          <text>总睡眠</text>
        </view>
        <view class="legend-item">
          <view class="legend-color rem"></view>
          <text>REM期</text>
        </view>
      </view>
    </view>
    
    <!-- 异常事件记录 -->
    <view class="events-card glass-card">
      <view class="card-header">
        <view class="card-title">
          <uni-icons type="alert" size="22" color="#ff69b4"></uni-icons>
          <text>异常事件记录</text>
        </view>
      </view>
      
      <view v-for="event in abnormalEvents" :key="event.date + event.time" class="event-item">
        <view class="event-icon" :style="{ background: getEventColor(event) + '20' }">
          <uni-icons 
            :type="getEventIcon(event.type)" 
            :color="getEventColor(event)" 
            size="24"
          ></uni-icons>
        </view>
        <view class="event-info">
          <view class="event-header">
            <text class="event-type">{{ event.type }}</text>
            <text class="event-desc" :style="{ color: getEventColor(event) }">
              {{ event.value }}
            </text>
          </view>
          <text class="event-time">{{ event.date }} {{ event.time }}</text>
        </view>
      </view>
    </view>
    
    <!-- 健康简报预览 -->
    <view class="preview-card glass-card">
      <view class="card-header">
        <view class="card-title">
          <uni-icons type="list" size="22" color="#ff69b4"></uni-icons>
          <text>健康简报预览</text>
        </view>
      </view>
      
      <view class="preview-content">
        <view class="preview-header">
          <text>7天趋势图</text>
          <uni-icons type="eye" size="18" color="#ff69b4"></uni-icons>
        </view>
        
        <view class="preview-chart">
          <view 
            v-for="(value, index) in previewData" 
            :key="index"
            class="preview-bar"
            :style="{ height: (value / 100 * 80) + 'rpx' }"
          ></view>
        </view>
        
        <button 
          class="preview-btn" 
          @click="handleExport"
          :disabled="exporting"
        >
          {{ exporting ? '导出中...' : '导出完整报告' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { getReportData, exportReport } from '@/api/report'
import { dateRanges, getDateRange } from '@/utils/date'

// ==================== 响应式数据 ====================
const exporting = ref(false)
const currentRangeIndex = ref(0)
const reportData = reactive({
  statistics: [],
  weeklyData: [],
  abnormalEvents: [],
  previewData: []
})

// ==================== 计算属性 ====================
const statistics = computed(() => reportData.statistics)
const weeklyData = computed(() => reportData.weeklyData)
const abnormalEvents = computed(() => reportData.abnormalEvents)
const previewData = computed(() => reportData.previewData)

const dateRange = computed(() => {
  return getDateRange(currentRangeIndex.value)
})

// ==================== 前端颜色/图标映射函数 ====================

// 统计卡片颜色映射
const getStatColor = (label) => {
  const colorMap = {
    '平均睡眠': '#ff69b4',
    '深睡比例': '#87cefa',
    '夜醒次数': '#98d8c8',
    '异常体温': '#ffb6c1'
  }
  return colorMap[label] || '#ff69b4'
}

// 趋势颜色映射
const getTrendColor = (trend) => {
  return trend > 0 ? '#ff69b4' : '#87cefa'
}

// 事件颜色映射
const getEventColor = (event) => {
  // 根据严重程度
  if (event.severity === 'high') return '#ff4444'
  if (event.severity === 'medium') return '#ff69b4'
  if (event.severity === 'low') return '#87cefa'
  
  // 根据事件类型
  const typeColorMap = {
    '体温偏高': '#ff69b4',
    '长时间哭闹': '#87cefa',
    '呼吸异常': '#98d8c8'
  }
  return typeColorMap[event.type] || '#ff69b4'
}

// 事件图标映射
const getEventIcon = (type) => {
  const iconMap = {
    '体温偏高': 'alert',
    '长时间哭闹': 'alert',
    '呼吸异常': 'alert'
  }
  return iconMap[type] || 'alert'
}

// 格式化统计值
const formatStatValue = (stat) => {
  return `${stat.value}${stat.unit}`
}

// ==================== 数据加载函数 ====================

// 加载报告数据
const loadReportData = async () => {
  uni.showLoading({ title: '加载中...' })
  
  try {
    const res = await getReportData({ dateRange: currentRangeIndex.value,eventsLimit:5 })
    reportData.statistics =  res[0].data.statistics
		reportData.previewData = res[1].data.previewData
		reportData.weeklyData =  res[1].data.weeklyData
		reportData.abnormalEvents =  res[2].data.abnormalEvents
  } catch (error) {
    uni.showToast({ title: '加载失败', icon: 'none' })
    console.error('获取报告数据失败:', error)
  } finally {
    uni.hideLoading()
  }
}

// 导出报告
const handleExport = async () => {
  exporting.value = true
  uni.showLoading({ title: '生成报告中...', mask: true })
  
  try {
    const res = await exportReport({ dateRange: dateRange.value })
    if (res.code === 200) {
      uni.showToast({ title: '导出成功', icon: 'success' })
      console.log('导出文件:', res.data)
      
      // 下载文件
      uni.downloadFile({
        url: res.data.url,
        success: (downloadRes) => {
          uni.openDocument({
            filePath: downloadRes.tempFilePath,
            success: () => {
              console.log('打开文档成功')
            }
          })
        }
      })
    }
  } catch (error) {
    uni.showToast({ title: '导出失败', icon: 'none' })
    console.error('导出失败:', error)
  } finally {
    uni.hideLoading()
    exporting.value = false
  }
}

// 打开日期选择器
const openDatePicker = () => {
  uni.showActionSheet({
    itemList: dateRanges,
    success: async (res) => {
      currentRangeIndex.value = res.tapIndex
      await loadReportData()
    },
    fail: () => {
      console.log('取消选择')
    }
  })
}

// ==================== 生命周期 ====================
onMounted(() => {
  loadReportData()
})
</script>

<style lang="scss" scoped>
.report-page {
  min-height: 100vh;
  padding: 30rpx;
  background: linear-gradient(135deg, #f0f8ff 0%, #fff0f5 100%);

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

  .date-selector {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 30rpx;
    margin-bottom: 30rpx;
    
    .selector-label {
      font-size: 28rpx;
      color: #5e5e7e;
    }
    
    .selected-date {
      display: flex;
      align-items: center;
      gap: 16rpx;
      color: #ff69b4;
      font-size: 28rpx;
      font-weight: 450;
      
      .uni-icons {
        transition: transform 0.2s;
      }
    }
    
    &:active {
      background: rgba(255, 255, 255, 0.9);
      
      .uni-icons {
        transform: translateY(4rpx);
      }
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;
    margin-bottom: 30rpx;

    .stat-card {
      text-align: center;
      
      .stat-label {
        display: block;
        font-size: 26rpx;
        color: #8a8aa8;
        margin-bottom: 16rpx;
      }
      
      .stat-value {
        display: block;
        font-size: 56rpx;
        font-weight: bold;
        margin-bottom: 16rpx;
        text-shadow: 0 4rpx 6rpx currentColor;
      }
      
      .stat-trend {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6rpx;
        font-size: 24rpx;
        background: rgba(255, 255, 255, 0.5);
        padding: 8rpx 0;
        border-radius: 40rpx;
      }
    }
  }

  .chart-card {
    .bar-chart {
      display: flex;
      justify-content: space-around;
      margin-bottom: 30rpx;
      
      .bar-group {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 80rpx;
        
        .bars {
          display: flex;
          gap: 8rpx;
          height: 240rpx;
          align-items: flex-end;
          margin-bottom: 16rpx;
          
          .bar {
            position: relative;
            width: 30rpx;
            border-radius: 12rpx 12rpx 6rpx 6rpx;
            transition: height 0.3s;
            
            &.sleep-bar {
              background: linear-gradient(to top, #87cefa, #7bb9e2);
              box-shadow: 0 -4rpx 12rpx #87cefa80;
            }
            
            &.rem-bar {
              background: linear-gradient(to top, #ff69b4, #ff88b0);
              box-shadow: 0 -4rpx 12rpx #ff69b480;
            }
            
            .bar-label {
              position: absolute;
              top: -36rpx;
              left: 50%;
              transform: translateX(-50%);
              font-size: 20rpx;
              color: #5e5e7e;
              white-space: nowrap;
              background: rgba(255, 255, 255, 0.8);
              padding: 4rpx 8rpx;
              border-radius: 20rpx;
            }
          }
        }
        
        .day-label {
          font-size: 26rpx;
          color: #8a8aa8;
        }
      }
    }
    
    .chart-legend {
      display: flex;
      justify-content: center;
      gap: 60rpx;
      
      .legend-item {
        display: flex;
        align-items: center;
        gap: 12rpx;
        
        .legend-color {
          width: 28rpx;
          height: 28rpx;
          border-radius: 8rpx;
          
          &.sleep {
            background: linear-gradient(145deg, #87cefa, #7bb9e2);
            box-shadow: 0 4rpx 12rpx #87cefa80;
          }
          
          &.rem {
            background: linear-gradient(145deg, #ff69b4, #ff88b0);
            box-shadow: 0 4rpx 12rpx #ff69b480;
          }
        }
        
        text {
          font-size: 26rpx;
          color: #5e5e7e;
        }
      }
    }
  }

  .events-card {
    .event-item {
      display: flex;
      margin-bottom: 30rpx;
      padding: 10rpx 0;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .event-icon {
        width: 70rpx;
        height: 70rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        margin-right: 24rpx;
        
        .uni-icons {
          filter: drop-shadow(0 4rpx 8rpx rgba(0,0,0,0.1));
        }
      }
      
      .event-info {
        flex: 1;
        
        .event-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8rpx;
          
          .event-type {
            font-size: 30rpx;
            font-weight: bold;
            color: #4a4a6a;
          }
          
          .event-desc {
            font-size: 26rpx;
            font-weight: 450;
          }
        }
        
        .event-time {
          font-size: 24rpx;
          color: #8a8aa8;
        }
      }
    }
  }

  .preview-card {
    .preview-content {
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.5), rgba(255, 240, 245, 0.5));
      border-radius: 28rpx;
      padding: 30rpx;
      
      .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30rpx;
        color: #5e5e7e;
        font-size: 28rpx;
      }
      
      .preview-chart {
        display: flex;
        align-items: flex-end;
        justify-content: space-around;
        height: 100rpx;
        margin-bottom: 30rpx;
        
        .preview-bar {
          width: 24rpx;
          background: linear-gradient(to top, #87cefa, #ff69b4);
          border-radius: 12rpx 12rpx 4rpx 4rpx;
          box-shadow: 0 -4rpx 12rpx #ff69b480;
        }
      }
      
      .preview-btn {
        width: 100%;
        height: 80rpx;
        line-height: 80rpx;
        background: transparent;
        border: 2rpx solid #ff69b4;
        color: #ff69b4;
        font-size: 28rpx;
        border-radius: 60rpx;
        font-weight: 450;
        
        &:active {
          background: #ff69b4;
          color: #fff;
        }
        
        &[disabled] {
          opacity: 0.5;
          border-color: #ccc;
          color: #999;
          pointer-events: none;
        }
      }
    }
  }
}
</style>