import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { HabitForm } from '@/components/habit-form'
import { DeleteButton } from '@/components/delete-button'
import { HabitEditButton } from '@/components/habit-edit-button'

export default async function HabitsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // 获取当前用户的所有习惯
  const { data: habits } = await supabase
    .from('habits')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">习惯管理</h1>
      </div>

      {/* 新建习惯的表单组件 */}
      <HabitForm />

      {/* 习惯列表 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">我的所有习惯</h2>
        {habits?.length === 0 && <p className="text-gray-500">还没有任何习惯，请在上方新建。</p>}
        {habits?.map(habit => (
          <div key={habit.id} className="flex justify-between items-center p-4 bg-white border rounded-lg">
            <div>
              <h3 className="font-medium text-lg">{habit.name}</h3>
              <p className="text-sm text-gray-500">
                奖励积分：{habit.reward_points} | {habit.track_duration ? '记录时长' : '普通打卡'}
              </p>
            </div>
            <div className="flex items-center">
              {/* 挂载编辑按钮 */}
              <HabitEditButton habit={habit} />
              <DeleteButton id={habit.id} table="habits" label={habit.name} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}