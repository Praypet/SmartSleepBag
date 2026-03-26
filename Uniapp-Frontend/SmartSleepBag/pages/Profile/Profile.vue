<template>
  <view class="profile-page">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-info">
        <image 
          :src="userInfo.avatar" 
          class="avatar"
          mode="aspectFill"
          @click="changeAvatar"
        ></image>
        <view class="user-detail">
          <text class="user-name">{{ userInfo.name }}</text>
          <text class="user-phone">{{ userInfo.phone }}</text>
        </view>
        <view class="edit-icon" @click="editProfile">✎</view>
      </view>
    </view>
    
    <!-- 宝宝信息 -->
    <view class="section-card">
      <view class="section-header">
        <text class="section-title">宝宝信息</text>
        <text class="edit-link" @click="editBabyInfo">编辑</text>
      </view>
      
      <view class="info-list">
        <view class="info-item">
          <text class="info-label">宝宝姓名</text>
          <text class="info-value">{{ babyInfo.name }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">出生日期</text>
          <text class="info-value">{{ babyInfo.birthday }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">性别</text>
          <text class="info-value">{{ babyInfo.gender }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">身高</text>
          <text class="info-value">{{ babyInfo.height }} cm</text>
        </view>
        <view class="info-item">
          <text class="info-label">体重</text>
          <text class="info-value">{{ babyInfo.weight }} kg</text>
        </view>
      </view>
    </view>
    
    <!-- 设备管理 -->
    <view class="section-card">
      <view class="section-header">
        <text class="section-title">设备管理</text>
      </view>
      
      <view class="device-info">
        <view class="device-item">
          <text class="device-label">当前设备</text>
          <view class="device-value">
            <text>{{ deviceInfo.name }}</text>
            <text class="device-status online">在线</text>
          </view>
        </view>
        <view class="device-item">
          <text class="device-label">设备电量</text>
          <view class="device-value">
            <text>{{ deviceInfo.battery }}%</text>
            <view class="battery-bar">
              <view 
                class="battery-fill" 
                :style="{ width: deviceInfo.battery + '%' }"
                :class="{ 
                  'battery-high': deviceInfo.battery > 60,
                  'battery-medium': deviceInfo.battery > 20 && deviceInfo.battery <= 60,
                  'battery-low': deviceInfo.battery <= 20
                }"
              ></view>
            </view>
          </view>
        </view>
        <view class="device-item">
          <text class="device-label">固件版本</text>
          <view class="device-value" @click="checkUpdate">
            <text>{{ deviceInfo.version }}</text>
            <text class="update-tag">检查更新</text>
          </view>
        </view>
        <view class="device-item">
          <text class="device-label">连接状态</text>
          <view class="device-value">
            <text>已连接</text>
            <text class="wifi-name">WiFi: Home_5G</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 设置选项 -->
    <view class="section-card">
      <view class="section-header">
        <text class="section-title">设置</text>
      </view>
      
      <view class="settings-list">
        <view class="setting-item" @click="goToSetting('notification')">
          <view class="setting-left">
            <uni-icons type="gear" size="26"></uni-icons>
            <text>通知设置</text>
          </view>
          <text class="setting-arrow">›</text>
        </view>
        <view class="setting-item" @click="goToSetting('temperature')">
          <view class="setting-left">
            <uni-icons type="notification" size="26"></uni-icons>
            <text>温度报警阈值</text>
          </view>
          <text class="setting-arrow">›</text>
        </view>
        <view class="setting-item" @click="goToSetting('privacy')">
          <view class="setting-left">
            <uni-icons type="locked" size="26"></uni-icons>
            <text>隐私设置</text>
          </view>
          <text class="setting-arrow">›</text>
        </view>
        <view class="setting-item" @click="goToSetting('about')">
          <view class="setting-left">
            <uni-icons type="contact" size="26"></uni-icons>
            <text>关于我们</text>
          </view>
          <text class="setting-arrow">›</text>
        </view>
      </view>
    </view>
    
    <!-- 退出登录 -->
    <button class="logout-btn" @click="logout">
      退出登录
    </button>
  </view>
</template>

<script setup>
import { ref } from 'vue'

// 用户信息
const userInfo = ref({
  avatar: '/static/avatar.png',
  name: '糯米妈妈',
  phone: '138****8888'
})

// 宝宝信息
const babyInfo = ref({
  name: '小糯米',
  birthday: '2025-09-01',
  gender: '女宝宝',
  height: 62,
  weight: 6.5
})

// 设备信息
const deviceInfo = ref({
  name: '智能睡袋-01',
  battery: 85,
  version: 'v2.1.0'
})

// 方法
const changeAvatar = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      const tempFilePaths = res.tempFilePaths
      userInfo.value.avatar = tempFilePaths[0]
      uni.showToast({
        title: '头像更新成功',
        icon: 'success'
      })
    }
  })
}

const editProfile = () => {
  uni.showToast({
    title: '编辑资料',
    icon: 'none'
  })
}

const editBabyInfo = () => {
  uni.showToast({
    title: '编辑宝宝信息',
    icon: 'none'
  })
}

const checkUpdate = () => {
  uni.showToast({
    title: '已是最新版本',
    icon: 'none'
  })
}

const goToSetting = (type) => {
  const titles = {
    notification: '通知设置',
    temperature: '温度报警阈值',
    privacy: '隐私设置',
    about: '关于我们'
  }
  
  uni.showToast({
    title: titles[type],
    icon: 'none'
  })
}

const logout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    confirmColor: '#ff69b4',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({
          title: '已退出登录',
          icon: 'success'
        })
        // 这里可以添加退出登录的逻辑
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  padding: 30rpx;
  background: linear-gradient(135deg, #f0f8ff 0%, #fff0f5 100%);

  .user-card {
    background: #fff;
    border-radius: 20rpx;
    padding: 40rpx;
    margin-bottom: 30rpx;
    
    .user-info {
      display: flex;
      align-items: center;
      
      .avatar {
        width: 140rpx;
        height: 140rpx;
        border-radius: 50%;
        background: #f0f0f0;
      }
      
      .user-detail {
        flex: 1;
        margin-left: 30rpx;
        
        .user-name {
          display: block;
          font-size: 36rpx;
          font-weight: bold;
          color: #333;
          margin-bottom: 8rpx;
        }
        
        .user-phone {
          display: block;
          font-size: 26rpx;
          color: #999;
        }
      }
      
      .edit-icon {
        width: 60rpx;
        height: 60rpx;
        line-height: 60rpx;
        text-align: center;
        background: #f0f0f0;
        border-radius: 50%;
        color: #87cefa;
        font-size: 32rpx;
      }
    }
  }

  .section-card {
    background: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 30rpx;
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30rpx;
      
      .section-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }
      
      .edit-link {
        font-size: 26rpx;
        color: #87cefa;
      }
    }
    
    .info-list {
      .info-item {
        display: flex;
        justify-content: space-between;
        padding: 20rpx 0;
        border-bottom: 2rpx solid #f0f0f0;
        
        &:last-child {
          border-bottom: none;
        }
        
        .info-label {
          font-size: 28rpx;
          color: #999;
        }
        
        .info-value {
          font-size: 28rpx;
          color: #333;
          font-weight: 500;
        }
      }
    }
    
    .device-info {
      .device-item {
        display: flex;
        justify-content: space-between;
        padding: 20rpx 0;
        border-bottom: 2rpx solid #f0f0f0;
        
        &:last-child {
          border-bottom: none;
        }
        
        .device-label {
          font-size: 28rpx;
          color: #999;
        }
        
        .device-value {
          display: flex;
          align-items: center;
          gap: 20rpx;
          
          .device-status {
            padding: 4rpx 16rpx;
            border-radius: 30rpx;
            font-size: 22rpx;
            
            &.online {
              background: #e8f5e9;
              color: #4caf50;
            }
          }
          
          .battery-bar {
            width: 100rpx;
            height: 20rpx;
            background: #f0f0f0;
            border-radius: 10rpx;
            overflow: hidden;
            
            .battery-fill {
              height: 100%;
              transition: width 0.3s;
              
              &.battery-high {
                background: #4caf50;
              }
              
              &.battery-medium {
                background: #ff9800;
              }
              
              &.battery-low {
                background: #ff4444;
              }
            }
          }
          
          .update-tag {
            padding: 4rpx 16rpx;
            background: #87cefa;
            color: #fff;
            font-size: 22rpx;
            border-radius: 30rpx;
          }
          
          .wifi-name {
            font-size: 24rpx;
            color: #999;
          }
        }
      }
    }
    
    .settings-list {
      .setting-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 30rpx 0;
        border-bottom: 2rpx solid #f0f0f0;
        
        &:last-child {
          border-bottom: none;
        }
        
        .setting-left {
          display: flex;
          align-items: center;
          gap: 20rpx;
          
          .setting-icon {
            font-size: 32rpx;
          }
          
          text {
            font-size: 28rpx;
            color: #333;
          }
        }
        
        .setting-arrow {
          font-size: 40rpx;
          color: #999;
        }
      }
    }
  }

  .logout-btn {
    width: 100%;
    height: 90rpx;
    line-height: 90rpx;
    background: #fff;
    color: #ff69b4;
    font-size: 32rpx;
    border: 2rpx solid #ff69b4;
    border-radius: 45rpx;
    margin-top: 30rpx;
  }
}
</style>