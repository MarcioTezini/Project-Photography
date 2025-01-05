'use client'

import dynamic from 'next/dynamic'
import { HeaderMenu } from '../HeaderMenu'
import { HeaderMenuMobile } from '../HeaderMenuMobile'
import React, { useEffect } from 'react'
import Cookies from 'js-cookie'
import { useHomeStore } from '@/stores/HomeStore'

const MediaQuery = dynamic(() => import('react-responsive'), {
  ssr: false,
})

export function HomeHeader() {
  const { setIsLoggedIn } = useHomeStore()

  useEffect(() => {
    const homeUserCookie = Cookies.get('homeUser')
    if (homeUserCookie) {
      const homeUserCookieParsed = JSON.parse(homeUserCookie)

      if (homeUserCookieParsed.level === 1) {
        setIsLoggedIn(true)
      } else {
        setIsLoggedIn(false)
        Cookies.remove('homeUser')
        Cookies.remove('homeToken')
      }
    } else {
      setIsLoggedIn(false)
      Cookies.remove('homeUser')
      Cookies.remove('homeToken')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <MediaQuery minWidth={1080}>
        <HeaderMenu />
      </MediaQuery>
      <MediaQuery maxWidth={1079}>
        <HeaderMenuMobile />
      </MediaQuery>
    </>
  )
}
