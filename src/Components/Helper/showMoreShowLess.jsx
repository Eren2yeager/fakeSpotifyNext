import React ,{useState} from 'react'

const ShowMoreShowLess = (props) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const truncatedText = props.text?.length > props.maxLength ? props.text?.substring(0, props.maxLength) + '...' : props.text;
  
    return (
      <p className={props.className}>
        {isExpanded ? props.text : truncatedText}
        {props.text?.length > props.maxLength && (
          <span
            className="font-bold cursor-pointer ml-2 whitespace-nowrap  text-white"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </span>
        )}
      </p>
    );
}

export default ShowMoreShowLess