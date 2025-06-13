#!/usr/bin/env python3
"""
Script para convertir notebooks de Jupyter a HTML con estilo personalizado
"""

import os
import subprocess
import glob
from pathlib import Path

def convert_notebooks():
    """Convierte todos los notebooks en la carpeta chapters"""
    
    # Directorio de capítulos
    chapters_dir = Path("chapters")
    
    # Buscar todos los archivos .ipynb
    notebooks = glob.glob(str(chapters_dir / "*.ipynb"))
    
    print(f"Encontrados {len(notebooks)} notebooks para convertir...")
    
    for notebook in notebooks:
        print(f"Convirtiendo: {notebook}")
        
        # Comando de conversión
        cmd = [
            "jupyter", "nbconvert",
            "--to", "html",
            "--template", "lab",  # Usa el template moderno de JupyterLab
            "--output-dir", str(chapters_dir),
            notebook
        ]
        
        try:
            subprocess.run(cmd, check=True, capture_output=True, text=True)
            print(f"✅ Convertido exitosamente: {notebook}")
        except subprocess.CalledProcessError as e:
            print(f"❌ Error convirtiendo {notebook}: {e.stderr}")

    print("\n🎉 Conversión completada!")

if __name__ == "__main__":
    convert_notebooks()