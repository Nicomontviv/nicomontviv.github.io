#!/bin/bash

# Nombre del archivo de salida
OUTPUT_FILE="estructura_proyecto.txt"

echo "Generando listado de archivos y carpetas..."

# Escribir encabezado en el archivo
echo "MAPA DEL PROYECTO" > "$OUTPUT_FILE"
echo "Directorio raíz: $(pwd)" >> "$OUTPUT_FILE"
echo "Fecha de generación: $(date)" >> "$OUTPUT_FILE"
echo "------------------------------------------" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Comando principal
# -not -path '*/.*' : ignora archivos/carpetas ocultas (como .git)
# -not -path './node_modules*' : ignora la carpeta de dependencias
find . -maxdepth 5 -not -path '*/.*' -not -path './node_modules*' >> "$OUTPUT_FILE"

echo "¡Listo! La estructura se ha guardado en: $OUTPUT_FILE"