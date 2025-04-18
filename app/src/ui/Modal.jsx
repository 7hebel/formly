import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import ReactDOM from 'react-dom';
import './modal.css';

let openModals = [];

export function Modal({ title, close, children }) {
  const modalRoot = document.getElementById('modal-root');
  const containerRef = useRef(null);
  const closeRef = useRef(null);
  const modalRef = useRef(null);

  function onClose() {
    if (modalRef && modalRef.current) {
      modalRef.current.classList.add('modal-transition');
      setTimeout(close, 250);
      openModals.splice(openModals.indexOf(title), 1);
      return () => clearTimeout(timer);
    }
  }

  if (!openModals.includes(title)) {
    openModals.push(title);
  }

  useEffect(() => {
    if (containerRef && containerRef.current) {
      containerRef.current.addEventListener("click", (event) => { 
        if (event.target.id === 'modal-container') onClose()
      });
    }

    if (closeRef && closeRef.current) {
      closeRef.current.addEventListener("click", (event) => { 
        onClose(); 
      });
    }

    if (modalRef && modalRef.current) {
      modalRef.current.classList.add('modal-transition');
      document.getElementById("modal-container").classList.add('modal-transition')
      const timer = setTimeout(() => {
        document.getElementById("modal-container").classList.remove('modal-transition')
        modalRef.current.classList.remove('modal-transition');
      }, 1);
      
      return () => clearTimeout(timer);
    }

  }, []);

  return ReactDOM.createPortal((
    <div id='modal-container' ref={containerRef}>
      <div className="modal" ref={modalRef} style={{marginTop: (10 * openModals.length) + 'px'}}>
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
  ), modalRoot);
}


