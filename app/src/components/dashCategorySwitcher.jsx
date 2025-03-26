import { useRef } from 'react';
import '../pages/styles/dashboard.css'

export default function DashboardCategorySwitcher({ viewRef, isActive=false, children }) {
  const buttonRef = useRef(0);

  function handleCategorySwitch() {
    document.querySelectorAll(".dashboard-category-switch").forEach(switcher => {
      switcher.setAttribute("active", "0");
    })
    document.querySelectorAll(".dash-category-content").forEach(switcher => {
      switcher.setAttribute("active", "0");
    })

    buttonRef.current.setAttribute("active", "1");
    viewRef.current.setAttribute("active", "1");
  }

  return (
    <button 
      className='dashboard-category-switch' 
      active={(isActive) ? 1 : 0}
      ref={buttonRef}
      onClick={handleCategorySwitch}
      >
        {children}
        <div className='active-category-glow'></div>
    </button>
  )
}

