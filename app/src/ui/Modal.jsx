import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import ReactDOM from 'react-dom';
import './modal.css';


export function Modal({ title, close, children }) {
  const modalRoot = document.getElementById('modal-root');
  const containerRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    if (containerRef && containerRef.current) {
      containerRef.current.addEventListener("click", (event) => { if (event.target.id == 'modal-container') close(); })
    }
    if (closeRef && closeRef.current) {
      closeRef.current.addEventListener("click", (event) => { close(); })
    }
  }, [])

  return ReactDOM.createPortal(
    (
      <div id='modal-container' ref={containerRef}>
        <div className="modal">
          <div className='modal-header'>
            <h1>{title}</h1>
            <X ref={closeRef}/>
          </div>
          <div className='hzSepMid'></div>
          <div className='modal-content'>
            {children}
          </div>
        </div>
      </div>
    ),
    modalRoot
  );
}

