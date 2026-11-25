'use client'

import { useState } from 'react'
import { HabitForm } from './habit-form'

export function HabitEditButton({ habit }: { habit: any }) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="text-sm text-blue-600 hover:underline mr-4"
      >
        编辑
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl">
            <HabitForm initialData={habit} onClose={() => setShowModal(false)} />
          </div>
        </div>
      )}
    </>
  )
}