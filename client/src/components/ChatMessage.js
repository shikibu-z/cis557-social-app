/* eslint-disable */
import React from 'react';
import '../stylesheets/ChatMessage.css';

function ChatMessage(props) {

  const { message, author, curUser, attachment } = props;

  const mediaTypes = {
    jpg: 'image',
    png: 'image',
    gif: 'image',
    mp4: 'video',
    '3gp': 'video',
    mp3: 'audio',
    ogg: 'audio',
  };

  let mediaType = '';
  const extension = attachment.split('.').pop();
  if (extension in mediaTypes) {
    mediaType = mediaTypes[extension];
  } else {
    mediaType = 'none';
  }

  if (author === curUser) {
    return (
      <div class="curUserMessage">
        <div class="right-message">
          {mediaType === 'video'
            && (
              <video width="420" height="340" controls>
                <source src={attachment} />
                <track src="captions_en.vtt" kind="captions" label="english_captions" />
              </video>
            )}
          {mediaType === 'image'
            && (
              <img width="200" height="auto" src={attachment} alt="could not media" />
            )}
          {mediaType === 'audio'
            && (
              <audio controls>
                <source src={attachment} />
                <track src="captions_en.vtt" kind="captions" label="english_captions" />
              </audio>
            )}
          {mediaType === 'none'
            && (
              <span>{message}</span>
            )}
        </div>
        {/* <img src="https://picsum.photos/200/300" alt="" /> */}
      </div>
    )
  }

  return (
    <div class="Message">
      {/* <img src='https://source.unsplash.com/ZHvM3XIOHoE' alt="" /> */}
      <div class="left-message">
        {mediaType === 'video'
          && (
            <video width="420" height="340" controls>
              <source src={attachment} />
              <track src="captions_en.vtt" kind="captions" label="english_captions" />
            </video>
          )}
        {mediaType === 'image'
          && (
            <img width="200" height="auto" src={attachment} alt="could not media" />
          )}
        {mediaType === 'audio'
          && (
            <audio controls>
              <source src={attachment} />
              <track src="captions_en.vtt" kind="captions" label="english_captions" />
            </audio>
          )}
        {mediaType === 'none'
          && (
            <span>{message}</span>
          )}
      </div>
    </div>
  );
}

export default ChatMessage;
