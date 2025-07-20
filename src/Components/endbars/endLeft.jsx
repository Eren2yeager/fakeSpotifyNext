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
    songName={currentSong?.name || "Select a Song to Play"}
    artistName={currentSong?.artist?.name || " "}
    imageUrl={currentSong?.image}
    showRightButton={true}
    className="justify-between"
  />
  )
}

export default EndLeft