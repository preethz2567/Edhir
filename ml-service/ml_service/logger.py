import logging
from pythonjsonlogger import jsonlogger

def setup_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    # Prevent duplicate logs if already configured
    if not logger.handlers:
        logHandler = logging.StreamHandler()
        formatter = jsonlogger.JsonFormatter(
            '%(timestamp)s %(levelValue)s %(name)s %(message)s',
            rename_fields={'levelname': 'levelValue', 'asctime': 'timestamp'}
        )
        logHandler.setFormatter(formatter)
        logger.addHandler(logHandler)
    
    return logger
