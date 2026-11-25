import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Heatmap } from '@/components/heatmap'

export default async function HabitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Next.js 16 的 params 是异步的，需要 await
  const { id } = await params

  // 并行拉取：习惯信息、打卡历史、连续天数
  const [
    { data: habit },
    { data: logs },
    { data: streak }
  ] = await Promise.all([
    supabase.from('habits').select('*').eq('id', id).single(),
    supabase.from('habit_logs').select('log_date, status, duration_minutes').eq('habit_id', id).order('log_date', { ascending: true }),
    supabase.from('streaks').select('current_streak, longest_streak').eq('habit_id', id).single()
  ])

  if (!habit) return notFound()

  const totalCheckIns = logs?.filter(l => l.status === 'done' || l.status === 'partial').length || 0
  
  // 计算总耗时
  const totalMinutes = logs?.reduce((acc, curr) => acc + (curr.duration_minutes || 0), 0) || 0
  
  const formatTotalDuration = () => {
    // 如果没开记录时长，或者总时长为0，返回 null（不显示）
    if (!habit.track_duration || totalMinutes === 0) return null;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours > 0 ? hours + ' 小时 ' : ''}${mins} 分钟`;
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      {/* 顶部导航 */}
      <div className="flex justify-between items-center">
        <Link href="/" className="text-blue-600 hover:underline text-sm font-medium">
          &larr; 返回首页
        </Link>
      </div>

      {/* 核心数据卡片 */}
      <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{habit.name}</h1>
          <p className="text-gray-500 mt-2"> {habit.reward_points} 积分/次</p>
        </div>
        <div className="flex gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-orange-500">{streak?.current_streak || 0}</div>
            <div className="text-xs text-gray-500 mt-1">当前连击</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-500">{totalCheckIns}</div>
            <div className="text-xs text-gray-500 mt-1">累计打卡</div>
          </div>
          
          {/* 如果有时长记录，显示总耗时 */}
          {formatTotalDuration() && (
            <div>
              <div className="text-2xl font-bold text-purple-500">{formatTotalDuration()}</div>
              <div className="text-xs text-gray-500 mt-1">总投入时长</div>
            </div>
          )}
        </div>
      </div>

      {/* 热力图 */}
      <Heatmap logs={logs || []} />
      
    </div>
  )
}