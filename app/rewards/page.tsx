import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { RewardForm } from '@/components/reward-form'
import { RedeemButton } from '@/components/redeem-button'
import { DeleteButton } from '@/components/delete-button'

export default async function RewardsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // 并行拉取：个人资料（积分）、奖励列表、兑换记录
  const [{ data: profile }, { data: rewards }, { data: redemptions }] = await Promise.all([
    supabase.from('profiles').select('points_balance').single(),
    supabase.from('rewards').select('*').eq('status', 'active').order('cost_points'),
    supabase.from('reward_redemptions').select('*, rewards(name)').order('redeemed_at', { ascending: false }).limit(10)
  ])

  const currentPoints = profile?.points_balance || 0

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">奖励商店</h1>
      </div>

      {/* 当前积分卡片 */}
      <div className="bg-orange-500 text-white p-6 rounded-xl shadow-md flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">我的可用积分</h2>
          <p className="text-orange-100 mt-1">完成习惯打卡来赚取更多积分吧！</p>
        </div>
        <div className="text-5xl font-bold">{currentPoints}</div>
      </div>

      <RewardForm />

      {/* 奖励列表 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">可兑换奖励</h2>
        {rewards?.length === 0 && <p className="text-gray-500">还没有奖励，快去上方创建一个吧！</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rewards?.map(reward => {
            const isOutOfStock = reward.stock === 0
            const cannotAfford = currentPoints < reward.cost_points
            return (
              <div key={reward.id} className="p-4 bg-white border rounded-lg flex flex-col justify-between">
                <div>
                  <h3 className="font-medium text-lg">{reward.name}</h3>
                  <p className="text-sm text-gray-500">需 {reward.cost_points} 积分</p>
                  <p className="text-xs text-gray-400 mt-1">
                    库存：{reward.stock === -1 ? '不限量' : reward.stock}
                  </p>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <DeleteButton id={reward.id} table="rewards" label={reward.name} />
                  <RedeemButton 
                    rewardId={reward.id} 
                    costPoints={reward.cost_points} 
                    isOutOfStock={isOutOfStock} 
                    cannotAfford={cannotAfford}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 历史兑换记录 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">最近兑换</h2>
        {redemptions?.length === 0 && <p className="text-gray-500">暂无兑换记录。</p>}
        <div className="space-y-2">
          {redemptions?.map(r => (
            <div key={r.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md text-sm">
              <span>兑换了：<strong>{r.rewards?.name}</strong></span>
              <span className="text-gray-500">花费 {r.cost_points} 积分 | {new Date(r.redeemed_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}