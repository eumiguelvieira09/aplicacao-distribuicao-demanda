import streamlit as st
import pandas as pd
import os
import smtplib
import schedule
import time
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime


EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = "587"
EMAIL_USERNAME = "miguelvieiradatascience@gmail.com"
EMAIL_PASSWORD = "adzw fflv yzmk jwix"
EMAIL_TO = "miguelvmesquitads@gmail.com"


# Caminho do arquivo CSV
CSV_FILE = "demandas.csv"
CHECK_INTERVAL = 10  # Intervalo de verificação em segundos
PREVIOUS_LINE_COUNT_FILE = "line_count.txt"
PREVIOUS_STATUS_FILE = "previous_status.csv"


def send_email(subject, body):
    msg = MIMEMultipart()
    msg["From"] = EMAIL_USERNAME
    msg["To"] = EMAIL_TO
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))
    try:
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.starttls()
            server.login(EMAIL_USERNAME, EMAIL_PASSWORD)
            server.sendmail(EMAIL_USERNAME, EMAIL_TO, msg.as_string())
        print("📧 E-mail enviado com sucesso!")
    except Exception as e:
        print(f"❌ Erro ao enviar e-mail: {e}")

# Enviar e-mail diário às 9h
def daily_email():
    send_email("Acesse o sistema", "Bom dia! Acesse o sistema: https://google.com.br")

schedule.every().day.at("14:06").do(daily_email)

# Função para obter número de linhas do CSV
def get_previous_line_count():
    if os.path.exists(PREVIOUS_LINE_COUNT_FILE):
        with open(PREVIOUS_LINE_COUNT_FILE, "r") as f:
            return int(f.read().strip())
    return 0

# Atualizar número de linhas
def update_line_count(count):
    with open(PREVIOUS_LINE_COUNT_FILE, "w") as f:
        f.write(str(count))

# Monitorar alterações no CSV
def monitor_csv():
    previous_line_count = get_previous_line_count()
    previous_status = pd.read_csv(PREVIOUS_STATUS_FILE) if os.path.exists(PREVIOUS_STATUS_FILE) else pd.DataFrame()
    
    while True:
        try:
            df = pd.read_csv(CSV_FILE)
            current_line_count = len(df)
            
            # Verificar novas demandas
            if current_line_count > previous_line_count:
                new_rows = df.iloc[previous_line_count:]
                send_email("Nova Demanda Registrada", f"Novas demandas:{new_rows.to_string(index=False)}")
                update_line_count(current_line_count)
            
            # Verificar alterações no status
            if not previous_status.empty:
                merged = df.merge(previous_status, on="Código da Tarefa", suffixes=("", "_old"))
                changed = merged[merged["Status"] != merged["Status_old"]]
                if not changed.empty:
                    send_email("Status Alterado", f"Mudança de status:{changed.to_string(index=False)}")
            
            df.to_csv(PREVIOUS_STATUS_FILE, index=False)
            previous_status = df.copy()
            previous_line_count = current_line_count
        except Exception as e:
            print(f"❌ Erro ao ler o CSV: {e}")
        
        schedule.run_pending()
        time.sleep(CHECK_INTERVAL)

# Iniciar o monitoramento
if __name__ == "__main__":
    monitor_csv()
