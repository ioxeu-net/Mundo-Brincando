"""Servidor local de pré-visualização do Mundo Brincando — Módulo Evoluído.
Sem dependências externas. Uso:  python servidor.py   e depois abra http://localhost:8000
(Serve apenas para testes no seu computador. O Cloudflare Pages não executa este arquivo.)
"""
import http.server
import os
import socketserver
import sys
import webbrowser

PORTA = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
PASTA = os.path.dirname(os.path.abspath(__file__))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PASTA, **kwargs)

    def end_headers(self):
        # Evita cache durante os testes, para você sempre ver a versão mais recente.
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


class Servidor(socketserver.ThreadingTCPServer):
    allow_reuse_address = True


if __name__ == "__main__":
    try:
        with Servidor(("127.0.0.1", PORTA), Handler) as httpd:
            url = f"http://localhost:{PORTA}"
            print(f"Servidor rodando em {url}")
            print("Para parar, aperte Ctrl + C nesta janela.")
            try:
                webbrowser.open(url)
            except Exception:
                pass
            httpd.serve_forever()
    except OSError:
        print(f"A porta {PORTA} já está em uso. Tente outra, por exemplo: python servidor.py 8080")
    except KeyboardInterrupt:
        print("\nServidor encerrado.")
