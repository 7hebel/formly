from modules import logs

from typing import NamedTuple, Any
from collections import namedtuple
import uuid
import json
import os


DBS_ROOT_PATH = "./data/"


class Database:
    def __init__(self, namespace: str, schema: tuple) -> None:
        self.namespace = namespace
        self.schema = schema
        self.__base_path = DBS_ROOT_PATH + namespace + "/"

        if not os.path.exists(self.__base_path):
            os.mkdir(self.__base_path)
            logs.info("Database", f"Created directory for database: {self.namespace}")

    def __filepath(self, entry_id: str) -> str:
        return self.__base_path + entry_id + ".json"

    def fetch(self, entry_id: str) -> dict | None:
        filepath = self.__filepath(entry_id)
        if not os.path.exists(filepath):
            return logs.error("Database", f"Failed to get raw entry: `{entry_id}` from DB: {self.namespace} (not found)")
        
        with open(filepath, "r") as file:
            return json.load(file)

    def fetch_all_where(self, where: filter) -> list[dict]:
        return list(filter(where, self.fetch_all()))
            
    def fetch_all(self) -> list[dict]:
        entries = []
        
        for file in os.listdir(self.__base_path):
            entry_id = file.split(".")[0]
            entry = self.fetch(entry_id)
            if entry is not None:
                entries.append(entry)

        return entries

    def save(self, entry_id: str, data: dict) -> None:
        filepath = self.__filepath(entry_id)
        with open(filepath, "w") as file:
            return json.dump(data, file, indent=2)
    
    def create(self, entry: dict) -> dict:
        for field_name in self.schema[1:]:
            if field_name not in entry:
                logs.error("Database", f"Failed to create row in DB: {self.namespace} (missing field `{field_name}` in entry: `{entry}`)")
                raise ValueError(f"Invalid entry: `{entry}` for DB: {self.namespace} with schema: `{self.schema}`")

        entry_id = uuid.uuid4().hex
        entry[self.schema[0]] = entry_id
        self.save(entry_id, entry)
    
        logs.info("Database", f"Created entry: `{entry_id}` in DB: {self.namespace}")
        return self.fetch(entry_id)

    def remove(self, entry_id: str) -> None:
        filepath = self.__filepath(entry_id)
        if not os.path.exists(filepath):
            return logs.error("Database", f"Failed to remove entry: `{entry_id}` from DB: {self.namespace} (not found)")
        
        os.remove(filepath)
        logs.warn("Database", f"Removed entry: `{entry_id}` from DB: {self.namespace}")
            
    def update_field(self, entry_id: str, fieldname: str, value: Any, i_push: bool = False, i_pop: bool = False, deep_field: str = "") -> None:
        """ 
        Update field in the entrie's content. 
        If i_push or i_pop flags are set, value will be appended to/popped from fieldname. 
        The i_pop uses .pop(key) for dicts and .remove(value) for other iterables.
        Deepfield is used to update fields within root dict like: content[fieldname][deep_field] = value
        Currently only single i_push/i_pop/deep_field is supported at once.
        """
        data = self.fetch(entry_id)
        if data is None:
            return logs.error("Database", f"Failed to update field in entry `{entry_id}` - `{fieldname}` = `{value}` in DB: {self.namespace}")

        if fieldname not in data:
            return logs.error("Database", f"Updating field: `{fieldname}` = `{value}` in entry: `{entry_id}` which is not present in the schema: `{self.schema}` in DB: {self.namespace}")

        try:
            if i_push:
                data[fieldname].append(value)
            elif i_pop:
                if isinstance(data[fieldname], dict):
                    data[fieldname].pop(value)
                else:
                    data[fieldname].remove(value)
            elif deep_field:
                data[fieldname][deep_field] = value
            else:
                data[fieldname] = value
                
            
        except ValueError as error:
            return logs.error("Database", f"Failed to update: `{fieldname}`=`{value}` in `{entry_id}` at DB: {self.namespace}: {error}")

        self.save(entry_id, data)
        logs.info("Database", f"Update: {self.namespace}::{entry_id} `{fieldname}`=`{value}`")
            


# List of all fields in the table. FIRST ONE IS KEY.
__FORMS_SCHEMA = ('form_id', 'author_uuid', 'structure', 'settings', 'assigned', 'responding', 'answers')
__USERS_SCHEMA = ('uuid', 'fullname', 'email', 'password', 'trusted_ip')
__LISTS_SCHEMA = ('list_id', 'owner_uuid', 'name', 'emails')

FormsDB = Database('Forms', __FORMS_SCHEMA)
UsersDB = Database('Users', __USERS_SCHEMA)
ListsDB = Database('Lists', __LISTS_SCHEMA)
