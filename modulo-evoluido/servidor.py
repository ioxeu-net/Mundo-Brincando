#!/usr/bin/env python3
"""Servidor local de pré-visualização. Não é usado na hospedagem Cloudflare Pages."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os

ROOT = Path(__file__).resolve().parent
PORT = int(os.environ.get("PORT", "8000"))

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        super().end_headers()

if __name__ == "__main__":
    print(f"Mundo Brincando Evoluído: http://localhost:{PORT}")
    print("Para encerrar, pressione Ctrl+C.")
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
