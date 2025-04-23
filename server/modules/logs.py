from datetime import datetime as Datetime
from dataclasses import dataclass
from typing import Literal
import colorama
import time

colorama.init()


# type "LogSubjectT" = Literal["API", "Forms", "Users", "Lists", "Database"]


@dataclass
class LogEntity:
    status: Literal['info', 'warn', 'error']
    content: str
    subject: str
    timestamp: int

        
def _print_log(log: LogEntity) -> None:
    log_content = f"({log.subject}) "
    
    if log.status == "info":
        log_content += f"{colorama.Fore.BLUE}INFO:{colorama.Fore.RESET}  "
    if log.status == "warn":
        log_content += f"{colorama.Fore.YELLOW}WARN:{colorama.Fore.RESET}  "
    if log.status == "error":
        log_content += f"{colorama.Fore.RED}ERROR:{colorama.Fore.RESET}  "
        
    log_content += log.content + colorama.Fore.RESET
    print(log_content)


def _save_log(log: LogEntity) -> None:
    filepath = "./data/logs/" + Datetime.now().strftime("%Y_%m_%d") + ".log"
    time_info = Datetime.now().strftime("%Y/%m/%d %H:%M:%S")
    log_content = f"{time_info} ({log.subject}) {log.status}:  {log.content}\n"
    
    with open(filepath, "a+") as file:
        file.write(log_content)
    

def _log(subject: str, status: Literal['info', 'warn', 'error'], content: str) -> None:    
    log_entity = LogEntity(status, content, subject, int(time.time()))

    _print_log(log_entity)
    _save_log(log_entity)


def info(subject: str, content: str) -> None:
    return _log(subject, "info", content)

def warn(subject: str, content: str) -> None:
    return _log(subject, "warn", content)

def error(subject: str, content: str) -> None:
    return _log(subject, "error", content)
