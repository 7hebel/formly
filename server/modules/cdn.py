from modules import logs

import uuid
import os


MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 mb

CDN_PATH = "./data/cdn/"
if not os.path.exists(CDN_PATH): os.mkdir(CDN_PATH)


def upload_object(content: bytes) -> tuple[bool, str]:
    file_id = uuid.uuid4().hex
    with open(CDN_PATH + f"/{file_id}", "a+b") as file:
        file.write(content)
        logs.info("Forms", f"Uploaded object of size {len(content)}b to CDN as: {file_id}")

    return (True, file_id)

