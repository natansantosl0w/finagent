import os
from dotenv import load_dotenv

load_dotenv()
chave = os.getenv("GOOGLE_API_KEY")
print("Chave carregada:", "OK" if chave else "ERRO")
if chave:
    print("Primeiros 10 chars:", chave[:10])
