# Aprendizaje del bot

Aquí ves las preguntas que el bot **no supo contestar bien** — y las usas para mejorarlo.

## Cómo se llena

Cada vez que el bot:

* No encuentra respuesta clara en la Knowledge Base
* Tiene baja confianza en su respuesta
* El cliente reformula la misma pregunta varias veces (señal de no-entendimiento)
* Tú tomas el control para responder algo (señal de que el bot no estaba acertando)

… la conversación queda registrada aquí para revisión.

## Qué ves

Lista de "casos de aprendizaje" con:

* **Pregunta del cliente**
* **Respuesta del bot** (la que dio, si dio alguna)
* **Tu respuesta** (si tomaste control)
* **Estado** (pendiente / revisado / agregado a KB)

## Acciones

Por cada caso puedes:

* **"Agregar a Knowledge Base"** — el sistema crea la entrada con la pregunta + tu respuesta corregida
* **"Marcar como revisado"** — descarta el caso (no necesita acción)
* **"Editar prompt del bot"** — si es un patrón recurrente, ajustar Settings → Bot Config

## Beneficio

Es un **bucle de mejora continua**:

1. El bot recibe pregunta nueva
2. No sabe responder bien
3. Tú revisas en aprendizaje
4. Agregas a KB
5. Próxima vez, el bot **sí sabe**

> Con el tiempo, la KB crece y el bot acierta cada vez más.

## Tips

* Revisa `/aprendizaje` **1 vez por semana** mínimo
* Es donde se ven las **oportunidades de venta perdidas** (clientes que preguntaron algo y el bot no los enganchó bien)
* Cada entrada que agregas = 1 conversación futura mejor
