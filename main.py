import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

model = genai.GenerativeModel('gemini-2.5-flash')

def finagent(pergunta):
    prompt = f"""
    Você é FinAgent, assistente financeiro brasileiro inteligente.
    
    PERGUNTA: {pergunta}
    
    Responda em PORTUGUÊS, direto e prático.
    Use R$ para valores.
    Seja específico com números e cálculos.
    """
    
    response = model.generate_content(prompt)
    return response.text

if __name__ == "__main__":
    print("🚀 FinAgent v1.0 Online!")
    while True:
        pergunta = input("\n💰 Pergunte sobre finanças (ou 'sair'): ")
        if pergunta.lower() == 'sair':
            print("👋 Até logo!")
            break
        print("🤖", finagent(pergunta))
