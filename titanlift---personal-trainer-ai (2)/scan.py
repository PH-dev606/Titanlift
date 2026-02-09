import os
import PIL.Image
from google import genai
from google.genai import types

# 1. Configuração da API
# Certifique-se de que a variável de ambiente API_KEY esteja configurada
# ou substitua diretamente pela sua string de chave (não recomendado para produção)
API_KEY = os.environ.get("API_KEY")

if not API_KEY:
    print("Erro: A variável de ambiente API_KEY não foi encontrada.")
    exit()

client = genai.Client(api_key=API_KEY)

def scan_print(image_path):
    """Lê uma imagem e extrai o texto/exercícios dela."""
    print(f"Lendo o arquivo: {image_path}...")
    
    try:
        img = PIL.Image.open(image_path)
        
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=[
                "Analise este print. Extraia todo o texto visível, especialmente nomes de exercícios, séries e repetições se houver.",
                img
            ]
        )
        
        print("\n--- TEXTO EXTRAÍDO ---")
        print(response.text)
        print("----------------------\n")
        
    except FileNotFoundError:
        print(f"Erro: O arquivo '{image_path}' não foi encontrado.")
    except Exception as e:
        print(f"Ocorreu um erro: {e}")

if __name__ == "__main__":
    # Nome do arquivo de print que você quer ler
    # Certifique-se de que o arquivo esteja na mesma pasta ou passe o caminho completo
    arquivo_print = "print.png" 
    
    scan_print(arquivo_print)
