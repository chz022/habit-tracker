'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { name: '今日打卡', path: '/', icon: '📝' },
  { name: '习惯管理', path: '/habits', icon: '🎯' },
  { name: '奖励商店', path: '/rewards', icon: '🎁' },
]

export function Navbar() {
  const pathname = usePathname()

  // 如果是登录页，不显示导航栏
  if (pathname === '/login') return null

  return (
    <>
      {/* 桌面端顶部导航栏 (md 及以上显示) */}
      <nav className="hidden md:flex sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b px-6 py-3 justify-center gap-8 shadow-sm">
        {navItems.map(item => {
          const isActive = pathname === item.path
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* 移动端底部导航栏 (md 以下显示) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t flex justify-around items-center pb-safe pt-2 px-2 pb-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {navItems.map(item => {
          const isActive = pathname === item.path
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex flex-col items-center justify-center w-full py-1 transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}