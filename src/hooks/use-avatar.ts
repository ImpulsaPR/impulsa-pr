'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'impulsa_avatar'

export function useAvatar() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setAvatarUrl(saved)
  }, [])

  const updateAvatar = useCallback((dataUrl: string) => {
    localStorage.setItem(STORAGE_KEY, dataUrl)
    setAvatarUrl(dataUrl)
  }, [])

  const removeAvatar = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setAvatarUrl(null)
  }, [])

  return { avatarUrl, updateAvatar, removeAvatar }
}
