'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function CheckInButton({ habitId, isDone, trackDuration }: { habitId: string, isDone: boolean, trackDuration?: boolean }) {
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  
  // --- 计时器状态 ---
  const [startTime, setStartTime] = useState<number | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [pauseStartTime, setPauseStartTime] = useState<number | null>(null)
  const [tick, setTick] = useState(0) // 用于每秒强制刷新 UI
  
  const supabase = createClient()
  const router = useRouter()

  // 计时器核心逻辑
  useEffect(() => {
    if (!showModal || isPaused || startTime === null) return
    const interval = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [showModal, isPaused, startTime])

  // 计算当前经过的毫秒数（如果暂停了，就定格在暂停那一刻）
  const currentElapsedMs = () => {
    if (startTime === null) return 0
    if (isPaused && pauseStartTime !== null) {
      return pauseStartTime - startTime
    }
    return Date.now() - startTime
  }

  // 格式化时间为 00:00:00
  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000)
    const h = Math.floor(totalSecs / 3600)
    const m = Math.floor((totalSecs % 3600) / 60)
    const s = totalSecs % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // 阻止事件冒泡，防止触发外层 Link 跳转
  function handleOpen(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    
    if (isDone) return
    
    if (trackDuration) {
      // 初始化秒表
      setShowModal(true)
      setStartTime(Date.now())
      setIsPaused(false)
      setPauseStartTime(null)
    } else {
      // 不需要记录时长，直接打卡
      executeCheckIn(null, null)
    }
  }

  // 暂停/继续
  function handleTogglePause(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    
    if (isPaused) {
      // 继续：把暂停的这段时间从开始时间里“抵消”掉
      if (pauseStartTime && startTime) {
        const pausedDuration = Date.now() - pauseStartTime
        setStartTime(startTime + pausedDuration)
      }
      setIsPaused(false)
      setPauseStartTime(null)
    } else {
      // 暂停
      setIsPaused(true)
      setPauseStartTime(Date.now())
    }
  }

  // 结束计时并保存
  function handleFinish(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    
    const finalMs = currentElapsedMs()
    if (finalMs < 1000 * 60) {
      if (!confirm('当前记录时长不足 1 分钟，确定要结束并打卡吗？')) return
    }
    
    const end = new Date()
    const start = new Date(end.getTime() - finalMs)
    // 将反推的 start 和真实的 end 传给后端，后端会自动算出精准的 duration
    executeCheckIn(start.toISOString(), end.toISOString())
  }

  // 取消计时
  function handleCancel(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (confirm('确定要放弃本次计时吗？')) {
      setShowModal(false)
    }
  }

  async function executeCheckIn(startIso: string | null, endIso: string | null) {
    setLoading(true)
    const { data, error } = await supabase.rpc('check_in', {
      p_habit_id: habitId,
      p_status: 'done',
      p_start_time: startIso,
      p_end_time: endIso
    })
    setLoading(false)

    if (error) {
      toast.error('网络错误：' + error.message)
      return
    }
    if (!data.ok) {
      toast.error(data.error) // 比如“今天已经打过卡啦”
      return
    }
    toast.success(`打卡成功，获得 ${data.points_earned} 积分！`)
    setShowModal(false)
    router.refresh() 
  }

  if (isDone) {
    return (
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} 
        disabled 
        className="px-4 py-2 bg-green-100 text-green-700 rounded-md font-medium cursor-not-allowed"
      >
        已完成 ✓
      </button>
    )
  }

  return (
    <>
      <button 
        onClick={handleOpen} 
        disabled={loading}
        className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors"
      >
        {loading ? '提交中...' : (trackDuration ? '开始计时' : '打卡')}
      </button>

      {/* 计时器弹窗 */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-700 mb-2">专注计时中</h3>
            
            {/* 巨大的倒计时数字 */}
            <div className="text-6xl font-mono font-bold text-blue-600 my-6 tracking-tight">
              {formatTime(currentElapsedMs())}
            </div>

            <div className="flex flex-col gap-3">
              {/* 暂停 / 继续 */}
              <button 
                type="button"
                onClick={handleTogglePause}
                disabled={loading}
                className={`w-full py-3 rounded-xl font-bold text-lg transition-colors ${
                  isPaused 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                }`}
              >
                {isPaused ? '▶ 继续' : '⏸ 暂停'}
              </button>

              {/* 结束并打卡 */}
              <button 
                type="button"
                onClick={handleFinish}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? '保存中...' : '结束计时并打卡'}
              </button>
              
              <button 
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="w-full py-2 text-gray-400 text-sm hover:text-gray-600 transition-colors mt-2"
              >
                放弃本次计时
              </button>
            </div>
            
          </div>
        </div>
      )}
    </>
  )
}