import React,{useState ,useContext ,useEffect} from 'react'
import RectangularSongCard from './RectangularSongCard'
import { CURRENT_SONG_CONTEXT } from '../../Contexts/audio.controls.'
import { usePlayer } from '../../Contexts/playerContext'

const EndLeft = (props) => {


  
  const {currentSong}=usePlayer();




  return (
    
    <RectangularSongCard
    marquee={{show:true}}
    showAddTolibraryButton={true}
    song={currentSong}
    showRightButton={true}
    className="justify-between"
  />
  )
}

export default React.memo(EndLeft)