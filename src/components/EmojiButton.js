import React  from "react";

export default function EmojiButton ({color="#333", size="35px", isOpened=(false), onclickCallback}) {

return (
<div onClick={onclickCallback} style={{cursor:"pointer"}}>
<svg fill={isOpened ? color : "#333"} 
 version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" 
	 width={size} height={size} viewBox="0 0 108.364 108.364"
	 xmlSpace="preserve">
<g>
	<path d="M54.182,0C24.258,0,0,24.258,0,54.182c0,29.924,24.258,54.183,54.182,54.183c29.923,0,54.182-24.259,54.182-54.183
			C108.364,24.258,84.105,0,54.182,0z M68.713,33.622c3.424,0,6.201,2.777,6.201,6.201c0,3.426-2.777,6.203-6.201,6.203
			c-3.423,0-6.203-2.777-6.203-6.203C62.51,36.399,65.29,33.622,68.713,33.622z M40.594,33.622c3.423,0,6.2,2.777,6.2,6.201
			c0,3.426-2.777,6.203-6.2,6.203c-3.423,0-6.201-2.777-6.201-6.203C34.393,36.399,37.17,33.622,40.594,33.622z M79.816,63.574
			c-4.283,9.904-14.317,16.304-25.562,16.304c-11.486,0-21.58-6.431-25.714-16.382c-0.184-0.443-0.135-0.949,0.132-1.348
			c0.266-0.397,0.713-0.637,1.192-0.637c0,0,0.001,0,0.002,0l48.638,0.061c0.482,0,0.932,0.244,1.196,0.646
			S80.008,63.131,79.816,63.574z"/>
</g>
</svg>


</div>
)

}