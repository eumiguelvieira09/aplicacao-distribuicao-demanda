import pandas as pd
import random
from datetime import datetime, timedelta

# Listas de valores possíveis para as colunas
usuarios = [f"Usuário {i}" for i in range(1, 11)]
empresas = ["Empresa A", "Empresa B", "Empresa C", "Empresa D"]
projetos = ["Projeto X", "Projeto Y", "Projeto Z", "Projeto W"]
status_options = ["Em andamento", "Finalizado", "Aguardando aprovação", "Cancelado"]
observacoes = ["Nenhuma", "Revisão necessária", "Atrasado", "Entrega antecipada", "Em conformidade"]

# Função para gerar datas aleatórias
def random_date(start_date, end_date):
    delta = end_date - start_date
    random_days = random.randint(0, delta.days)
    return start_date + timedelta(days=random_days)

# Gerar DataFrame
data = []
start_reference = datetime(2024, 1, 1)
end_reference = datetime(2025, 3, 1)

for _ in range(30):
    usuario = random.choice(usuarios)
    empresa = random.choice(empresas)
    projeto = random.choice(projetos)
    data_inicio = random_date(start_reference, end_reference)
    status = random.choice(status_options)
    data_final = random_date(data_inicio, end_reference) if status == "Finalizado" else None
    observacao = random.choice(observacoes)
    
    data.append([usuario, empresa, projeto, data_inicio.strftime("%Y-%m-%d"), status, 
                 data_final.strftime("%Y-%m-%d") if data_final else None, observacao])

df = pd.DataFrame(data, columns=["Usuário(s)", "Empresa", "Projeto", "Data de Início", "Status", "Data Final", "Observação"])
df
