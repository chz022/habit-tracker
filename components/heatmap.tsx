'use client'

// 简单的日期格式化辅助函数 (YYYY-MM-DD)
function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

export function Heatmap({ logs }: { logs: { log_date: string, status: string }[] }) {
  // 1. 生成过去 120 天的日期数组
  const today = new Date()
  const days = []
  
  for (let i = 119; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push({
      date: formatDate(d),
      displayDate: `${d.getMonth() + 1}月${d.getDate()}日`
    })
  }

  // 2. 将打卡记录转换为 Set，方便快速查找
  const doneSet = new Set(logs.filter(l => l.status === 'done' || l.status === 'partial').map(l => l.log_date))

  // 3. 颜色配置
  const getColor = (dateStr: string) => {
    if (doneSet.has(dateStr)) return 'bg-green-500 hover:bg-green-600' // 已打卡：绿色
    return 'bg-gray-100 hover:bg-gray-200' // 未打卡：浅灰
  }

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-700">最近 120 天打卡记录</h3>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span>⭕</span>
          <div className="w-3 h-3 rounded-sm bg-gray-100"></div>
          <div className="w-3 h-3 rounded-sm bg-green-500"></div>
          <span>✔</span>
        </div>
      </div>
      
      {/* 网格容器：7行，自动按列排列 */}
      <div className="grid grid-rows-7 grid-flow-col gap-1.5 w-max">
        {days.map((day) => (
          <div
            key={day.date}
            title={`${day.displayDate} ${doneSet.has(day.date) ? '已完成打卡' : '未打卡'}`}
            className={`w-4 h-4 rounded-sm transition-colors cursor-pointer ${getColor(day.date)}`}
          />
        ))}
      </div>
    </div>
  )
}