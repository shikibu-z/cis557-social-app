/* eslint-disable no-unneeded-ternary */
/* eslint-disable no-nested-ternary */
import { React, useState } from 'react';
import '../stylesheets/ImageBox.css';

function ImageBox(props) {
  const { image } = props;
  const [file, setFile] = useState(null);

  const fileHandler = (e) => {
    setFile(e.target.files[0]);
  };

  function handleClick() {
    document.getElementById('imgInp').click();
  }

  return (
    <div>
      <form id="form1" runat="server">
        <input onChange={fileHandler} type="file" id="imgInp" />
        <div className="image-container">
          <img onClick={handleClick} role="none" onKeyPress={handleClick} id="image" src={file ? URL.createObjectURL(file) : (image ? image : null)} alt="" height="300px" width="300px" style={{ 'object-fit': 'cover' }} />
        </div>
      </form>
    </div>
  );
}

export default ImageBox;
