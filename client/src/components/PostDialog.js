import React from 'react';
import '../stylesheets/PostDialog.css';

function PostDialog(props) {
  const { handleClose, content } = props;
  return (
    <div className="popup-box">
      <div className="box">
        <button type="button" className="close-icon" onClick={handleClose} onKeyDown={handleClose}>x</button>
        {content}
      </div>
    </div>
  );
}

export default PostDialog;
