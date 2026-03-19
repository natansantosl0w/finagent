import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

model = genai.GenerativeModel('gemini-2.5-flash')
response = model.generate_content("FinAgent v1.0 online! Teste realizado com sucesso.")
print("✅ Gemini:", response.text)
