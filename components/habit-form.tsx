'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

// 定义传入的数据类型
type Habit = {
  id: string
  name: string
  reward_points: number
  track_duration: boolean
}

export function HabitForm({ initialData, onClose }: { initialData?: Habit, onClose?: () => void }) {
  const [name, setName] = useState(initialData?.name || '')
  const [points, setPoints] = useState(initialData?.reward_points?.toString() || '10')
  const [trackDuration, setTrackDuration] = useState(initialData?.track_duration || false)
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()
  
  const isEditing = !!initialData

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return toast.error('请输入习惯名称')

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      name: name,
      reward_points: parseInt(points) || 10,
      track_duration: trackDuration,
    }

    let error;
    if (isEditing) {
      // 更新操作
      const res = await supabase.from('habits').update(payload).eq('id', initialData.id)
      error = res.error
    } else {
      // 插入操作
      const res = await supabase.from('habits').insert({ ...payload, user_id: user.id })
      error = res.error
    }

    setLoading(false)

    if (error) {
      toast.error((isEditing ? '修改失败：' : '创建失败：') + error.message)
      return
    }

    toast.success(isEditing ? '习惯已更新' : '习惯已创建')
    setName('')
    if (onClose) onClose() // 如果是弹窗，关闭弹窗
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-50 border rounded-lg space-y-4">
      <h2 className="text-lg font-semibold">{isEditing ? '编辑习惯' : '新建习惯'}</h2>
      <div>
        <label className="block text-sm mb-1">习惯名称</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="比如：每天喝 8 杯水"
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">完成奖励积分</label>
        <input
          type="number"
          value={points}
          onChange={e => setPoints(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>
      <div className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          id="trackDuration"
          checked={trackDuration}
          onChange={e => setTrackDuration(e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />
        <label htmlFor="trackDuration" className="text-sm text-gray-700 cursor-pointer">
          打卡时记录完成时长
        </label>
      </div>
      
      <div className="flex gap-2 justify-end pt-2">
        {onClose && (
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            取消
          </button>
        )}
        <button 
          type="submit" 
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '保存中...' : (isEditing ? '保存修改' : '创建习惯')}
        </button>
      </div>
    </form>
  )
}