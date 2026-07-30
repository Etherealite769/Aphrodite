import os
import sys
import re
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class RangeRequestHandler(SimpleHTTPRequestHandler):
    """
    Custom HTTP Request Handler supporting Byte Range requests (HTTP 206)
    necessary for HTML5 audio streaming and smooth seeking.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "public, max-age=31536000")
        super().end_headers()

    def send_head(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            return super().send_head()

        if not os.path.exists(path):
            self.send_error(404, "File not found")
            return None

        range_header = self.headers.get('Range')
        if not range_header or not range_header.startswith('bytes='):
            return super().send_head()

        file_size = os.path.getsize(path)
        match = re.match(r'bytes=(\d+)-(\d+)?', range_header)
        if not match:
            return super().send_head()

        start = int(match.group(1))
        end = int(match.group(2)) if match.group(2) else file_size - 1

        if start >= file_size or end >= file_size or start > end:
            self.send_response(416, "Requested Range Not Satisfiable")
            self.send_header("Content-Range", f"bytes */{file_size}")
            self.end_headers()
            return None

        length = end - start + 1
        ctype = self.guess_type(path)

        self.send_response(206, "Partial Content")
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(length))
        self.send_header("Content-Range", f"bytes {start}-{end}/{file_size}")
        self.send_header("Accept-Ranges", "bytes")
        self.end_headers()

        try:
            f = open(path, 'rb')
            f.seek(start)
            return RangeFileWrapper(f, length)
        except OSError:
            self.send_error(404, "File open error")
            return None

class RangeFileWrapper:
    """Wrapper to write only requested byte slice to output stream."""
    def __init__(self, file_obj, max_bytes):
        self.file_obj = file_obj
        self.bytes_remaining = max_bytes

    def read(self, size=-1):
        if self.bytes_remaining <= 0:
            return b""
        read_size = size if size > 0 else self.bytes_remaining
        read_size = min(read_size, self.bytes_remaining)
        data = self.file_obj.read(read_size)
        self.bytes_remaining -= len(data)
        return data

    def close(self):
        self.file_obj.close()

def run_server(port=PORT):
    server_address = ('', port)
    httpd = HTTPServer(server_address, RangeRequestHandler)
    print(f"\n========================================================")
    print(f"  Aphrodite Music Web Animation Server Running!")
    print(f"  Access URL: http://localhost:{port}")
    print(f"  Press Ctrl+C to stop the server.")
    print(f"========================================================\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[Server] Shutting down gracefully...")
        httpd.server_close()

if __name__ == "__main__":
    port_arg = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    run_server(port_arg)
