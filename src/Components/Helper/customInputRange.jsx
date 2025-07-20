import React ,{useState ,useEffect, useRef} from 'react'

const CustomInputRange = (props) => {

  const seekBarRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

//    if you want local values that is changing on draging
 






  // Calculate seek time from mouse X
  const calculateSeekValue = (clientX) => {
    const seekbar = seekBarRef.current;
    if (
      !seekbar ||
      !props.max ||
      isNaN(props.max)
    )
      return;

    const rect = seekbar.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const seekPercent = Math.min(Math.max(offsetX / rect.width, 0), 1);
    return seekPercent *props.max;
  };

  // When clicking or dragging
  const handleSeek = (clientX , shouldSetAudio = !props.localState) => {
    const seekValue = calculateSeekValue(clientX );
    if (seekValue !== undefined) {
    //  onChange function given by user
    if(props.localState){
        props.localState.setLocalValue(seekValue)
    }
    if(shouldSetAudio){
        props.onChange(seekValue)
    }
      
    }
  };


// update when draging (supportable for both phone and desktop)
  useEffect(() => {

    const handleMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      if (isDragging) handleSeek(clientX);
    };
  
    const handleUp = (e) => {
      const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
      if (isDragging) {
        handleSeek(clientX , true); // final seek
        setIsDragging(false);
        props.isDragingRef.current = false;
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging]);




  const current =  isDragging && props.localState ? props.localState.localValue : props.value;

  const duration = props.max|| 1; // prevent divide by 0
  const progressPercent = (current / duration) * 100;




  return (
<div
        className={`relative ${
          props.width || `w-[100%]`
        }   flex  h-1 items-center z-0 overflow-visible bg-white/35 cursor-pointer rounded group/seekbar`}
        ref={seekBarRef}
        onMouseDown={props.wantControls !=false ? ( (e) => {
            setIsDragging(true);
            props.isDragingRef.current = true;
            handleSeek(e.clientX);
        }) : undefined}
        onTouchStart={props.wantControls !=false ?  ((e) => {
          setIsDragging(true);
          props.isDragingRef.current = true;
          handleSeek(e.touches[0].clientX);
        }) : undefined}


        
      >
        {/* Green Progress Bar */}
        <div
          className={`absolute left-0 top-0 h-full transition-transform duration-75  bg-white sm:group-active/seekbar:bg-green-500 sm:group-hover/seekbar:bg-green-500  rounded`}
          style={{ width: `${progressPercent}%`, zIndex: 1 }}
        />
         
         {
          props.wantThumb !=false && 
        <div
        className="absolute top-1/2 w-3 h-3 transition-transform duration-75 bg-white rounded-full  shadow -translate-y-1/2 sm:invisible  group-hover/seekbar:visible group-active/seekbar:visible"
        style={{ left: `calc(${progressPercent}% - 5px)`, zIndex: 10 }}
        />
      }
      </div>
  )
}

export default CustomInputRange;





// props 
// width : any width in tailwind
// wantControls : true or false (true default)
// wantThumb : true or false (true default)
// max 
// min