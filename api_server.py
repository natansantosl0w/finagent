from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

app = FastAPI(title="Moni API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = genai.GenerativeModel('gemini-2.5-flash')

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        history_text = ""
        for msg in request.history[-10:]:
            role = "Usuário" if msg.role == "user" else "Moni"
            history_text += f"{role}: {msg.content}\n"

        prompt = f"""Você é o Moni (masculino), um assistente financeiro pessoal brasileiro inteligente e moderno.

Histórico da conversa:
{history_text}
Usuário: {request.message}

Instruções:
- Responda SEMPRE em português brasileiro
- Leve em conta o histórico da conversa para dar respostas contextuais
- Apresente-se como "sou o Moni" apenas se for a primeira mensagem
- Seja direto, prático e didático
- Use R$ para todos os valores monetários
- Faça cálculos específicos quando necessário
- Foco em: finanças pessoais, investimentos, orçamento, dívidas, planejamento financeiro
- Nunca mencione empresas ou marcas específicas
- Dê exemplos reais e aplicáveis
- Use **negrito** para destacar pontos importantes
- Use listas com "- " quando listar itens

Moni:"""

        response = model.generate_content(prompt)
        return {"reply": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"status": "Moni online", "version": "1.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
