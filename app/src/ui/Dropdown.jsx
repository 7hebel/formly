import { GradingSchemasManager } from "../components/GradingSchemas";
import { useState, useRef } from "react"
import { TertiaryButton } from "./Button";
import { ChevronDown, Edit } from "lucide-react";
import { useClickOutside } from 'react-haiku';
import { Modal } from "./Modal";

export function DropdownGroup({ id, items={}, selectedItemID, setter, refresh }) {
  const [isOpen, setIsOpen] = useState(false); 
  const [selectedID, setSelectedID] = useState(selectedItemID);
  const [selectedTitle, setSelectedTitle] = useState(items[selectedItemID]?.title ?? "Percentage (%)"); 
  const [isEditSchemasOpen, setIsEditSchemasOpen] = useState(false);
  const dropdownRef = useRef(null);

  useClickOutside(dropdownRef, () => {if(!isEditSchemasOpen) setIsOpen(false)});

  function onChange(id, title) {
    setSelectedID(id);
    setSelectedTitle(title);
    setter(id);
    setIsOpen(false);
  } 

  items["%"] = {
    "schema_id": "%",
    "title": "Percentage (%)"
  }

  return (
    <>
      <div id={id} ref={dropdownRef} className="dropdown-group" _value={selectedID} onClick={() => {setIsOpen(!isOpen)}}>
        <label>{selectedTitle ?? '-'} <ChevronDown/></label>
        {
          isOpen? (
            <div className="dropdown-items-container">
              {
                Object.values(items).map(data => (
                  <div key={data.schema_id}>
                    <div className="dropdown-item" id={data.schema_id} onClick={() => onChange(data.schema_id, data.title)}>{data.title}</div>
                    <div className="hzSep"></div>
                  </div>
                ))
              }
              <TertiaryButton onClick={() => setIsEditSchemasOpen(true)}>
                <Edit/>Edit schemas
              </TertiaryButton>
            </div>
          ) : <></>
        }
      </div>
      {
        isEditSchemasOpen? (
          <Modal title="Manage grading schemas" close={(v) => {setIsEditSchemasOpen(false); refresh()}}>
            <GradingSchemasManager></GradingSchemasManager>
          </Modal>
        ) : <></>
      }
    </>
  )

}

export function DropdownItem({ id, children }) {
  return <div className="dropdown-item" id={id}>{children}</div>
}