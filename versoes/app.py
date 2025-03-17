import streamlit as st

# Definir a chave secreta
CHAVE_SECRETA = "minha_chave_123"

# Verificar se a chave já foi autenticada
if "autenticado" not in st.session_state:
    st.session_state.autenticado = False

# Criar campo de autenticação
with st.sidebar:
    st.write("🔑 **Autenticação**")
    chave_input = st.text_input("Digite a chave de acesso:", type="password")
    if st.button("Entrar"):
        if chave_input == CHAVE_SECRETA:
            st.session_state.autenticado = True
            st.success("✅ Autenticação bem-sucedida! Acesso total permitido.")
        else:
            st.session_state.autenticado = False
            st.error("❌ Chave incorreta. Acesso restrito.")

# Definir as abas
abas = ["Aba Restrita", "Aba Livre"]

# Se o usuário **não** estiver autenticado, remover a aba restrita
if not st.session_state.autenticado:
    abas = ["Aba Livre"]

# Criar menu de abas
aba_selecionada = st.radio("Escolha uma aba:", abas)

# Conteúdo de cada aba
if aba_selecionada == "Aba Restrita":
    st.subheader("🔒 Área Restrita")
    st.write("Bem-vindo à aba protegida! Somente usuários com a chave podem acessá-la.")
elif aba_selecionada == "Aba Livre":
    st.subheader("🔓 Área Livre")
    st.write("Esta aba está acessível para todos os usuários.")
