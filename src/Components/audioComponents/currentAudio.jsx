import React from 'react'
import { CURRENT_SONG_CONTEXT } from '../../Contexts/audio.controls.'
const CurrentAudio = (props) => {
  const ContextCurrentSong = React.useContext(CURRENT_SONG_CONTEXT)

  return (
    <audio
    onLoadedMetadata={props.onLoadedMetadata}
    onTimeUpdate={props.onTimeUpdate}
    ref={props.ref}
  >
    <source src={ContextCurrentSong.currentSong.fileUrl} />
  </audio>
  )
}

export default CurrentAudio;