import google.generativeai as genai
import os

genai.configure(api_key="AIzaSyApmn3GCGzNUyxgeexGdahLU6_h4qpP-ds")

print("Modelos disponíveis:")
for model in genai.list_models():
    if 'generateContent' in model.supported_generation_methods:
        print(f"- {model.name}")
