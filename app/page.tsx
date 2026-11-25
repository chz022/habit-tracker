import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckInButton } from '@/components/check-in-button'
import { DeleteButton } from '@/components/delete-button'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const today = new Intl.DateTimeFormat('en-CA', { 
    timeZone: 'Asia/Shanghai', 
    year: 'numeric', month: '2-digit', day: '2-digit' 
  }).format(new Date())

  // 并行拉取：习惯、今日打卡、积分、连续天数、最近5条流水
  const [
    { data: habits }, 
    { data: logs }, 
    { data: profile },
    { data: streaks },
    { data: transactions }
  ] = await Promise.all([
    supabase.from('habits').select('*').eq('status', 'active').order('created_at'),
    supabase.from('habit_logs').select('habit_id, status').eq('log_date', today),
    supabase.from('profiles').select('points_balance').single(),
    supabase.from('streaks').select('habit_id, current_streak'),
    supabase.from('point_transactions').select('*').order('created_at', { ascending: false }).limit(5)
  ])

  // 将今日打卡和连续天数转成 Map，方便查询
  const doneSet = new Set(logs?.filter(l => l.status === 'done' || l.status === 'partial').map(l => l.habit_id))
  const streakMap = new Map(streaks?.map(s => [s.habit_id, s.current_streak]))

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      {/* 顶部积分卡片 (可点击跳转) */}
      <Link href="/rewards" className="block bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-colors text-white p-6 rounded-xl shadow-md cursor-pointer">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">今日打卡</h1>
            <p className="text-blue-100 mt-2">你好，{user.email}</p>
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-5xl font-bold">{profile?.points_balance || 0}</span>
          <span className="text-blue-100">可用积分</span>
        </div>
      </Link>

      {/* 习惯列表 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">你的习惯</h2>
        </div>
        
        {habits?.length === 0 && (
          <div className="text-center p-8 bg-white border border-dashed rounded-xl text-gray-500">
            还没有创建习惯，去管理页面新建一个吧！
          </div>
        )}
        
        {habits?.map(habit => {
          const isDone = doneSet.has(habit.id)
          const currentStreak = streakMap.get(habit.id) || 0
          return (
            <Link href={`/habits/${habit.id}`} key={habit.id} className="flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{habit.name}</h3>
                  {currentStreak > 0 && (
                    <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full font-bold">
                      🔥 已连击 {currentStreak} 天
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">完成可得 {habit.reward_points} 积分</p>
              </div>
              <CheckInButton habitId={habit.id} isDone={isDone} trackDuration={habit.track_duration} />
            </Link>
          )
        })}
      </div>

      {/* 最近积分流水 */}
      <div className="space-y-4 pt-4 border-t">
        <h2 className="text-lg font-bold text-gray-700">最近动态</h2>
        <div className="bg-white border rounded-xl overflow-hidden">
          {transactions?.length === 0 ? (
            <p className="p-4 text-center text-gray-500 text-sm">暂无记录</p>
          ) : (
            <ul className="divide-y">
              {transactions?.map(tx => (
                <li key={tx.id} className="p-3 flex justify-between items-center text-sm">
                  <span className="text-gray-600">{tx.reason}</span>
                  <span className={`font-bold ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}