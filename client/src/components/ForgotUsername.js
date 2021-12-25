import {
  Modal, Form,
} from 'react-bootstrap';
import React, { useState } from 'react';

function ForgotUsername(props) {
  const [email, setEmail] = useState(null);
  const [sent, setSent] = useState(false);
  const onSend = () => {
    // handle sending email
    setSent(true);
  };
  const { show, onHide } = props;
  const onClose = () => {
    setSent(false);
    onHide();
  };
  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton />
      <Modal.Body className="ModalDialog">
        {!sent ? (
          <Form>
            <Form.Group>
              <Form.Label>Send Username to this email</Form.Label>
              <Form.Control type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Form.Group>
            <div className="button-group">
              <button className="btn" type="button" onClick={onSend}>
                Send
              </button>
            </div>
          </Form>
        ) : (
          <h2 style={{ 'text-align': 'center', width: '280px', height: '140px' }}>Email Sent</h2>
        )}

      </Modal.Body>
    </Modal>
  );
}

export default ForgotUsername;
