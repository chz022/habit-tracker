'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true) // true为登录，false为注册
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  
  const supabase = createClient()
  const router = useRouter()

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return setErrorMsg('请输入邮箱和密码')
    if (password.length < 6) return setErrorMsg('密码长度至少需要 6 位')

    setLoading(true)
    setErrorMsg('')

    let result;

    if (isLogin) {
      // 登录逻辑
      result = await supabase.auth.signInWithPassword({
        email,
        password,
      })
    } else {
      // 注册逻辑
      result = await supabase.auth.signUp({
        email,
        password,
      })
    }

    setLoading(false)

    if (result.error) {
      setErrorMsg(result.error.message)
      return
    }

    // 注册成功（且关闭了邮箱确认）或登录成功
    if (result.data.session) {
      // 使用 router.refresh() 刷新服务端组件状态，然后跳转
      router.refresh()
      router.push('/')
    } else if (!isLogin && !result.data.session) {
      // 如果开启了邮箱确认，注册后不会有 session
      alert('注册成功！请前往邮箱点击确认链接后再登录。')
      setIsLogin(true)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-sm space-y-6 bg-white p-8 rounded-xl shadow-lg border">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {isLogin ? '欢迎回来' : '创建新账号'}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {isLogin ? '登录以继续你的习惯打卡' : '注册一个账号来开始打卡'}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-500 text-sm p-3 rounded-md border border-red-100">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input
              type="password"
              placeholder="至少 6 位字符"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
          </button>
        </form>

        <div className="text-center text-sm text-gray-500">
          {isLogin ? '还没有账号？' : '已经有账号了？'}
          <button 
            type="button"
            onClick={() => {
              setIsLogin(!isLogin)
              setErrorMsg('')
            }}
            className="ml-1 text-blue-600 hover:underline font-medium"
          >
            {isLogin ? '去注册' : '去登录'}
          </button>
        </div>
      </div>
    </div>
  )
}