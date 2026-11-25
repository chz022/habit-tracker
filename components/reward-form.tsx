'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function RewardForm() {
  const [name, setName] = useState('')
  const [points, setPoints] = useState('50')
  const [stock, setStock] = useState('-1') // -1 代表不限量
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return toast.error('请输入名称')

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase.from('rewards').insert({
      name: name,
      cost_points: parseInt(points) || 50,
      stock: parseInt(stock),
      user_id: user.id,
    })

    setLoading(false)
    if (error) {
      toast.error('创建失败：' + error.message)
      return
    }
    toast.success('创建成功')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-orange-50 border border-orange-100 rounded-lg space-y-4">
      <h2 className="text-lg font-semibold text-orange-800">新建奖励</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm mb-1">奖励名称</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="比如：看一集动漫"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">需要积分</label>
          <input
            type="number"
            value={points}
            onChange={e => setPoints(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">库存 (-1为不限)</label>
          <input
            type="number"
            value={stock}
            onChange={e => setStock(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>
      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 disabled:opacity-50"
      >
        {loading ? '创建中...' : '创建奖励'}
      </button>
    </form>
  )
}