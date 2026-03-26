import { Tool } from '@langchain/core/tools';
import { dataSyncService } from '../services/dataSync.service';
import { memoryStore } from '../memory/memoryStore';
import { logger } from '../utils/logger';

// 首页传感器数据工具
export class HomeSensorsTool extends Tool {
  name = 'home_sensors';
  description = '获取首页显示的宝宝周围传感器数据（温度、心率、呼吸、体动）。';
  private babyId?: string;
  private userId?: string;

  constructor(babyId?: string, userId?: string) {
    super();
    this.babyId = babyId;
    this.userId = userId;
  }

  async _call(_: string): Promise<string> {
    logger.info('获取首页传感器数据');
    const data = await dataSyncService.getSensors();

    // 存储到 PostgreSQL（eventStore）
    if (this.babyId && this.userId && data && Array.isArray(data)) {
      try {
        for (const sensor of data) {
          let eventType = 'unknown';
          let value = sensor.value;
          let unit = sensor.unit;

          // 根据传感器类型映射事件类型
          switch (sensor.label) {
            case '体温':
              eventType = 'temperature';
              break;
            case '心率':
              eventType = 'heart_rate';
              break;
            case '呼吸':
              eventType = 'respiratory_rate';
              break;
            case '体动':
              eventType = 'body_movement';
              break;
          }

          await memoryStore.storeHealthEvent(this.babyId, this.userId, {
            event_type: eventType,
            value: value,
            unit: unit,
            notes: `首页传感器数据: ${sensor.label}`
          });
        }
        logger.info(`首页传感器数据已存储 [宝宝: ${this.babyId}]`);
      } catch (error) {
        logger.error('存储首页传感器数据失败:', error);
      }
    }

    return JSON.stringify(data);
  }
}

// 监测传感器数据工具
export class MonitorSensorsTool extends Tool {
  name = 'monitor_sensors';
  description = '获取环境监测的各项传感器实时数据（环境温度、心率、呼吸、环境湿度）。';
  private babyId?: string;
  private userId?: string;

  constructor(babyId?: string, userId?: string) {
    super();
    this.babyId = babyId;
    this.userId = userId;
  }

  async _call(_: string): Promise<string> {
    logger.info('获取监测传感器数据');
    const data = await dataSyncService.getMonitorSensors();

    // 存储到 PostgreSQL（eventStore）
    if (this.babyId && this.userId && data && Array.isArray(data)) {
      try {
        for (const sensor of data) {
          let eventType = 'unknown';
          let value = sensor.value;
          let unit = sensor.unit;

          // 根据传感器类型映射事件类型
          switch (sensor.name) {
            case '环境温度':
              eventType = 'environment_temperature';
              break;
            case '心率':
              eventType = 'heart_rate';
              break;
            case '呼吸':
              eventType = 'respiratory_rate';
              break;
            case '环境湿度':
              eventType = 'environment_humidity';
              break;
          }

          await memoryStore.storeHealthEvent(this.babyId, this.userId, {
            event_type: eventType,
            value: value,
            unit: unit,
            notes: `环境监测传感器: ${sensor.name} - ${sensor.status}`
          });
        }
        logger.info(`监测传感器数据已存储 [宝宝: ${this.babyId}]`);
      } catch (error) {
        logger.error('存储监测传感器数据失败:', error);
      }
    }

    return JSON.stringify(data);
  }
}

