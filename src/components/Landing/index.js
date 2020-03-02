import React, { useEffect, useContext, useState, useRef } from 'react'
import { useSpring, animated } from 'react-spring'
import ReactDOM from 'react-dom'
import { useHistory } from 'react-router-dom'
import { useInView } from 'react-intersection-observer'

import { FirebaseContext } from '../Firebase'
import styles from './styles.module.scss'
import { YearGoalsDemo } from './YearGoalsDemo'
import { MonthGoalsDemo } from './MonthGoalsDemo'
import { DayGoalsDemo } from './DayGoalsDemo'

function Landing() {
  const [error, setError] = useState(null)
  const [heightAnimation, setHeightAnimation] = useState(false)
  const signInRef = useRef(null)
  const [scrollRef, inViewScroll] = useInView()

  const yearVisibility = useSpring({
    padding: heightAnimation ? '15vh 0 0vh 0' : '30vh 0vh 20vh 0vh',
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
    if (inViewScroll) {
      setHeightAnimation(true)
    } else if (!heightAnimation) {
      setHeightAnimation(false)
    }
  }, [inViewScroll])

  useEffect(() => {
    firebase.logEvent('visit_the_landing_page')
    document.body.style.display = 'block'
    document.getElementById('root').style.display = 'none'

    return () => (document.getElementById('root').style.display = 'block')
  }, []) // eslint-disable-line

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

  // function signInWithFb() {
  //   firebase.logEvent('clicked_signin_with_facebook')
  //   firebase
  //     .signInWithFacebook()
  //     .then(handleSignIn)
  //     .then(() => {
  //       firebase.logEvent('signin')
  //       setError(null)
  //       history.push('/')
  //     })
  //     .catch(error => {
  //       setError(error.message)
  //     })
  // }

  function scrollInto() {
    signInRef.current.scrollIntoView()
  }

  return ReactDOM.createPortal(
    <>
      <main onScroll={console.log}>
        <section className={styles.Hero}>
          <header>
            <div>
              <button
                type="button"
                onClick={() => {
                  firebase.logEvent('scroll_to_signin_buttons')
                  scrollInto()
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
            <button
              className={styles.Google}
              type="button"
              onClick={() => {
                signInWithGoogle()
              }}
            >
              with Google
            </button>
            {/* <button
              className={styles.Facebook}
              type="button"
              onClick={() => {
                signInWithFb()
              }}
            >
              with Facebook
            </button> */}
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
