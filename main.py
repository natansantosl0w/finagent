from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import pandas as pd
import io

app = FastAPI(
    title="FinAgent - MVP",
    description="Agente de IA para análise de CSV de transações financeiras",
    version="1.0.0"
)

@app.post("/analyze")
async def analyze_transactions(file: UploadFile = File(...)):
    try:
        # 1. Ler CSV enviado
        content = await file.read()
        df = pd.read_csv(io.StringIO(content.decode("utf-8")))

        # 2. Validar colunas obrigatórias
        required_cols = ["date", "description", "amount", "category", "type"]
        if not all(col in df.columns for col in required_cols):
            return JSONResponse(
                status_code=400,
                content={
                    "error": f"CSV deve ter colunas: {required_cols}"
                }
            )

        # 3. Limpeza de dados
        df["amount"] = pd.to_numeric(df["amount"], errors="coerce")
        df = df.dropna(subset=["amount"])

        # 4. Separar receitas e despesas
        df["type"] = df["type"].str.lower()
        is_income = df["type"] == "income"
        total_income = df[is_income]["amount"].sum()
        total_expense = df[~is_income]["amount"].sum()

        # 5. Estatísticas
        avg_income = df[is_income]["amount"].mean() if is_income.sum() > 0 else 0
        avg_expense = df[~is_income]["amount"].mean() if (~is_income).sum() > 0 else 0

        # 6. Resumo final
        summary = {
            "status": "success",
            "total_transactions": len(df),
            "total_income": round(float(total_income), 2),
            "total_expense": round(float(total_expense), 2),
            "net_balance": round(float(total_income - total_expense), 2),
            "avg_income": round(float(avg_income), 2) if avg_income else 0,
            "avg_expense": round(float(avg_expense), 2) if avg_expense else 0,
            "income_transactions": int(is_income.sum()),
            "expense_transactions": int((~is_income).sum()),
            "columns": df.columns.tolist()
        }

        return summary

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "status": "error"}
        )

@app.get("/")
async def root():
    return {"message": "FinAgent API - Agente de IA para transações financeiras"}
