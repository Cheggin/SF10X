from loguru import logger

def read_txt_file(file_path: str) -> str:
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            body = f.read()
            return body
    except FileNotFoundError as f_e:
        logger.error(f"File not found. {f_e.__str__()}")
        raise Exception(f"File reading failed: {file_path.split('/')[-1]}")