import dayjs from 'dayjs'

// 生成前1-10周的选项
export const generateWeekOptions = () => {
  const options = []
  for (let i = 0; i < 10; i++) {
    options.push(i === 0 ? '本周' : `${i}周前`)}
  return options
}

// 日期范围选项
export const dateRanges = generateWeekOptions()

// 获取周一到周日的日期范围
const getWeekRange = (date) => {
  const day = date.day()
  const monday = date.subtract(day === 0 ? 6 : day - 1, 'day')
  const sunday = monday.add(6, 'day')
  return {
    start: monday.format('YYYY-MM-DD'),
    end: sunday.format('YYYY-MM-DD')
  }
}

// 获取日期范围
export const getDateRange = (rangeIndex) => {
  const now = dayjs()
	
  switch(dateRanges[rangeIndex]) {
    case '本周':
      return getWeekRange(now)
    case '上周':
      return getWeekRange(now.subtract(7, 'day'))
    default:
      return getWeekRange(now.subtract(7*rangeIndex, 'day'))
  }
}

// 更新日期
export const updateDate = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const weekday = weekdays[date.getDay()]
  return `${year}年${month}月${day}日 ${weekday}`
}