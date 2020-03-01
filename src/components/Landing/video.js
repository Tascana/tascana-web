// custom HTML5 video element wrapper, playback triggers only when visible
// this is a hacky workaround because of a react ref's issues with video tag
import React, { useEffect } from 'react'
import styles from './styles.module.scss'
import { useInView } from 'react-intersection-observer'

export const Video = ({ src }) => {
  const [divRef, inView] = useInView()
  let videoRef = null

  useEffect(() => {
    async function playback() {
      if (inView) {
        await videoRef.play()
      }
    }
    playback()
  }, [inView])

  return (
    <div ref={divRef}>
      <video
        width="100%"
        height="auto"
        preload="metadata"
        muted="muted"
        ref={ref => (videoRef = ref)}
        className={styles.video}
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  )
}
