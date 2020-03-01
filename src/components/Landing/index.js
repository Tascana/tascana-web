import React, { useEffect, useContext, useState, useRef } from 'react'
import { useSpring, animated } from 'react-spring'
import ReactDOM from 'react-dom'
import { useHistory } from 'react-router-dom'
import { FirebaseContext } from '../Firebase'
import styles from './styles.module.scss'
import { YearGoalsDemo } from './YearGoalsDemo'
import { MonthGoalsDemo } from './MonthGoalsDemo'
import { DayGoalsDemo } from './DayGoalsDemo'

function scroll(element) {
  let start = null
  const target = element && element ? element.getBoundingClientRect().top : 0
  const firstPos = window.pageYOffset || document.documentElement.scrollTop
  let pos = 0

  ;(function() {
    var browser = ['ms', 'moz', 'webkit', 'o']

    for (
      let x = 0, length = browser.length;
      x < length && !window.requestAnimationFrame;
      x++
    ) {
      window.requestAnimationFrame =
        window[browser[x] + 'RequestAnimationFrame']
      window.cancelAnimationFrame =
        window[browser[x] + 'CancelAnimationFrame'] ||
        window[browser[x] + 'CancelRequestAnimationFrame']
    }
  })()

  function showAnimation(timestamp) {
    if (!start) {
      start = timestamp || new Date().getTime()
    }

    let elapsed = timestamp - start
    let progress = elapsed / 600

    const outQuad = function(n) {
      return n * (2 - n)
    }

    let easeInPercentage = +outQuad(progress).toFixed(2)

    pos =
      target === 0
        ? firstPos - firstPos * easeInPercentage
        : firstPos + target * easeInPercentage

    window.scrollTo(0, pos)

    if (
      (target !== 0 && pos >= firstPos + target) ||
      (target === 0 && pos <= 0)
    ) {
      cancelAnimationFrame(start)
      pos = 0
    } else {
      window.requestAnimationFrame(showAnimation)
    }
  }
  window.requestAnimationFrame(showAnimation)
}

function Landing() {
  const [error, setError] = useState(null)
  const [heightAnimation, setHeightAnimation] = useState(true)
  const scrollRef = useRef(null)

  const yearVisibility = useSpring({
    padding: heightAnimation ? '30vh 0 20vh 0' : '15vh 0vh 0vh 0vh',
  })

  const firebase = useContext(FirebaseContext)
  const history = useHistory()

  useEffect(() => {
    const tooltips = Array.from(document.querySelectorAll('.' + styles.Tooltip))

    tooltips.forEach(tooltip => {
      tooltip.style.right = -tooltip.offsetWidth / 2 + 100 - 12 + 'px'
    })
  })

  useEffect(() => {
    const eventListener = e => {
      const top = e.srcElement.scrollTop

      if (top === 0) {
        setHeightAnimation(true)
      } else {
        setHeightAnimation(false)
        refCurrent.removeEventListener('scroll', eventListener)
      }
    }
    const refCurrent = scrollRef.current

    refCurrent.addEventListener('scroll', eventListener)

    return () => refCurrent.removeEventListener('scroll', eventListener)
  }, [scrollRef])

  useEffect(() => {
    firebase.logEvent('visit_the_landing_page')
    document.body.style.display = 'block'
  }) // eslint-disable-line

  function handleSignIn(socialAuthUser) {
    return firebase.user(socialAuthUser.user.uid).set({
      username: socialAuthUser.user.displayName,
      email: socialAuthUser.user.email,
    })
  }

  function signInWithGoogle() {
    firebase.logEvent('clicked_signin_with_google')
    firebase
      .signInWithGoogle()
      .then(handleSignIn)
      .then(user => {
        firebase.logEvent('signin')
        setError(null)
        history.push('/')
      })
      .catch(error => {
        setError(error.message)
      })
  }

  function signInWithFb() {
    firebase.logEvent('clicked_signin_with_facebook')
    firebase
      .signInWithFacebook()
      .then(handleSignIn)
      .then(() => {
        firebase.logEvent('signin')
        setError(null)
        history.push('/')
      })
      .catch(error => {
        setError(error.message)
      })
  }

  return ReactDOM.createPortal(
    <>
      <main>
        <section className={styles.Hero}>
          <header>
            <div>
              <button
                type="button"
                onClick={() => {
                  firebase.logEvent('scroll_to_signin_buttons')
                  scroll(document.getElementById('signin'))
                }}
              >
                Sign in
              </button>
            </div>
            <h1 className={styles.Title}>
              Achieve your <nobr>long-term</nobr> goals with Tascana
            </h1>
          </header>
          <div className={styles.HeroImage} />
        </section>
      </main>
      <main className={styles.MoreInfoSection} ref={scrollRef}>
        <div className={styles.MobileHeroImage} />
        <animated.div style={yearVisibility}>
          <YearGoalsDemo />
        </animated.div>
        <MonthGoalsDemo />
        <DayGoalsDemo />
        <section className={styles.SignIn} id="signin">
          <h2>Sign in</h2>
          <div className={styles.SignInButtons}>
            <button
              className={styles.Google}
              type="button"
              onClick={() => {
                signInWithGoogle()
              }}
            >
              with Google
            </button>
            <button
              className={styles.Facebook}
              type="button"
              onClick={() => {
                signInWithFb()
              }}
            >
              with Facebook
            </button>
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
