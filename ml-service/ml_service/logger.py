import logging
from pythonjsonlogger import jsonlogger
from opentelemetry import trace

class OpenTelemetryJsonFormatter(jsonlogger.JsonFormatter):
    def add_fields(self, log_record, record, message_dict):
        super().add_fields(log_record, record, message_dict)
        span = trace.get_current_span()
        if span and span.get_span_context().is_valid:
            ctx = span.get_span_context()
            log_record['trace_id'] = format(ctx.trace_id, '032x')
            log_record['span_id'] = format(ctx.span_id, '016x')

def setup_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    # Prevent duplicate logs if already configured
    if not logger.handlers:
        logHandler = logging.StreamHandler()
        formatter = OpenTelemetryJsonFormatter(
            '%(timestamp)s %(levelValue)s %(name)s %(message)s',
            rename_fields={'levelname': 'levelValue', 'asctime': 'timestamp'}
        )
        logHandler.setFormatter(formatter)
        logger.addHandler(logHandler)
    
    return logger
