'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface RedeemButtonProps {
  rewardId: string
  costPoints: number
  isOutOfStock: boolean
  cannotAfford: boolean
}

export function RedeemButton({ rewardId, costPoints, isOutOfStock, cannotAfford }: RedeemButtonProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function handleRedeem() {
    if (isOutOfStock || cannotAfford) return
    if (!confirm(`确定要花费 ${costPoints} 积分兑换吗？`)) return

    setLoading(true)
    const { data, error } = await supabase.rpc('redeem_reward', {
      p_reward_id: rewardId
    })
    setLoading(false)

    if (error) {
      toast.error('网络错误：' + error.message)
      return
    }
    if (!data.ok) {
      toast.error(data.error) // 比如“积分不足”
      return
    }
    toast.success('兑换成功！')
    router.refresh()
  }

  // 根据状态计算按钮文案
  let btnText = '立即兑换'
  if (loading) {
    btnText = '兑换中...'
  } else if (isOutOfStock) {
    btnText = '库存不足'
  } else if (cannotAfford) {
    btnText = '积分不足'
  }

  const isDisabled = loading || isOutOfStock || cannotAfford

  return (
    <button
      onClick={handleRedeem}
      disabled={isDisabled}
      className={`px-4 py-2 rounded-md font-medium transition-colors ${
        isDisabled
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-orange-500 text-white hover:bg-orange-600'
      }`}
    >
      {btnText}
    </button>
  )
}