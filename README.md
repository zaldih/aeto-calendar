# Calendario Alterna en tu Ocio

_Disclaimer: este proyecto es ajeno a la organización responsable del programa._

Este proyecto analiza la web del proyecto "Alterna en tu Ocio" para obtener las próximas actividades programadas y las agrega automáticamente a un Calendario de Google con todos los detalles.

Para ello, se descargan los PDFs de las actividades y se analizan para estructurar la información.

## Deploy

Primero necesitarás copiar **.env.example** en **.env** y rellenar con los datos requeridos.

Ejecutar el script **run.sh** para realizar un analisis.

Esto se puede combinar con **crontab** para realizar el barrido periodicamente. Un ejemplo podría ser:

```bash
# Run Daily at 14:00
PROJECT_PATH=/path/to/project
0 14 * * * cd ${PROJECT_PATH}; ./run.sh >> ${PROJECT_PATH}/data/log.txt 2>&1

```
