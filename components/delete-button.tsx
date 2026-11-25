'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function DeleteButton({ id, table, label }: { id: string, table: 'habits' | 'rewards', label: string }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`确定要删除【${label}】吗？相关的打卡记录也会被一并删除！`)) return

    setLoading(true)
    const { error } = await supabase.from(table).delete().eq('id', id)
    setLoading(false)

    if (error) {
      toast.error('删除失败：' + error.message)
      return
    }
    toast.success('删除成功')
    router.refresh()
  }

  return (
    <button 
      onClick={handleDelete} 
      disabled={loading}
      className="text-sm text-red-500 hover:text-red-700 hover:underline disabled:opacity-50"
    >
      {loading ? '删除中...' : '删除'}
    </button>
  )
}