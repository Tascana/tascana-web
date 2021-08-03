// @ts-nocheck
import React, { useEffect, useState, useRef } from 'react'
import { useSpring, animated } from 'react-spring'
import ReactDOM from 'react-dom'
import { useHistory } from 'react-router-dom'
import { useInView } from 'react-intersection-observer'

import styles from './styles.module.scss'
import { YearGoalsDemo } from './YearGoalsDemo'
import { MonthGoalsDemo } from './MonthGoalsDemo'
import { DayGoalsDemo } from './DayGoalsDemo'
import { SignInButton, SignInButtonProvider, SignInButtonSize } from '../SignInButton'
import { useAuth } from '../../hooks/use-auth'
import { useLogger } from '../../hooks/use-logger'
import { INDEX_PAGE_PATH } from '../../constants/route'

function Landing() {
  const [error, setError] = useState(null)
  const [heightAnimation, setHeightAnimation] = useState(false)
  const signInRef = useRef(null)
  const [scrollRef, inViewScroll] = useInView()
  const [, user] = useAuth()
  const { logEvent } = useLogger()

  const yearVisibility = useSpring({
    padding: heightAnimation ? '15vh 0 0vh 0' : '30vh 0vh 20vh 0vh',
  })

  const history = useHistory()

  useEffect(() => {
    const tooltips = Array.from(document.querySelectorAll('.' + styles.Tooltip))

    tooltips.forEach(tooltip => {
      tooltip.style.right = -tooltip.offsetWidth / 2 + 100 - 12 + 'px'
    })
  })

  useEffect(() => {
    if (inViewScroll) {
      setHeightAnimation(true)
    } else if (!heightAnimation) {
      setHeightAnimation(false)
    }
  }, [heightAnimation, inViewScroll])

  useEffect(() => {
    logEvent('visit_the_landing_page')
    document.body.style.display = 'block'
    document.getElementById('root').style.display = 'none'

    return () => (document.getElementById('root').style.display = 'block')
  }, []) // eslint-disable-line

  function onError(error) {
    setError(error.message)
  }

  function onSignIn() {
    logEvent('signin')
    setError(null)
    history.push(INDEX_PAGE_PATH)
  }

  function scrollInto() {
    signInRef.current.scrollIntoView()
  }

  if (user) {
    history.push(INDEX_PAGE_PATH)
    return null
  }

  return ReactDOM.createPortal(
    <>
      <main>
        <section className={styles.Hero}>
          <header>
            <div>
              <SignInButton
                text="Sign in"
                onClick={() => {
                  logEvent('scroll_to_signin_buttons')
                  scrollInto()
                }}
                size={SignInButtonSize.S}
              />
            </div>
            <h1 className={styles.Title}>
              Achieve your <nobr>long-term</nobr> goals with Tascana
            </h1>
          </header>
          <div className={styles.HeroImage} />
        </section>
      </main>
      <main className={styles.MoreInfoSection}>
        <div className={styles.MobileHeroImage} />
        <animated.div style={yearVisibility}>
          <YearGoalsDemo />
        </animated.div>
        <div ref={scrollRef}>
          <MonthGoalsDemo />
        </div>
        <DayGoalsDemo />
        <section ref={signInRef} className={styles.SignIn} id="signin">
          <h2>Sign in</h2>
          <div className={styles.SignInButtons}>
            <SignInButton
              text="with Google"
              onClick={() => logEvent('clicked_signin_with_google')}
              onSignInSuccess={onSignIn}
              onSignInFailure={onError}
              provider={SignInButtonProvider.GOOGLE}
            />
            <SignInButton
              text="with Facebook"
              onClick={() => logEvent('clicked_signin_with_facebook')}
              onSignInSuccess={onSignIn}
              onSignInFailure={onError}
              provider={SignInButtonProvider.FACEBOOK}
            />
          </div>
          {error && <div>{error}</div>}
          <p className={styles.Note}>
            reach us at <a href="mailto:team@tascana.com">team@tascana.com</a>
          </p>
        </section>
      </main>
    </>,
    document.getElementById('landing-root'),
  )
}

export default Landing
