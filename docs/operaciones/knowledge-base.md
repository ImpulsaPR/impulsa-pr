# Knowledge Base (KB)

La **base de conocimiento** es la memoria de tu negocio — preguntas frecuentes con respuestas que el bot consulta cuando un cliente pregunta algo.

## Cómo funciona

* Cargas pares **pregunta → respuesta**
* El bot, cuando un cliente le escribe, **busca semánticamente** en la KB usando embeddings (pgvector)
* Si encuentra coincidencia, usa esa respuesta como contexto al responder

## Para qué sirve

* Que el bot **conteste con TUS palabras** y no genéricas
* Reducir alucinaciones del bot (responde solo lo que hay en la KB para temas específicos)
* Mantener consistencia (todos los clientes reciben la misma info correcta)

## Ejemplos de preguntas para cargar

* "¿Cuáles son sus horarios?"
* "¿Aceptan tarjeta de crédito?"
* "¿Hacen domicilio?"
* "¿Cuánto cuesta una limpieza dental?"
* "¿Tienen estacionamiento?"
* "¿Atienden niños?"
* "¿Cuánto dura el tratamiento X?"

## Crear una entrada

1. Ve a `/knowledge` → **"+ Nueva entrada"**
2. Llena:
   * **Pregunta** (cómo la haría un cliente)
   * **Respuesta** (con tus palabras, tono, longitud)

## Industry Pack pre-carga muchas

Cuando aplicas tu industry pack, la KB se llena con **3-5 preguntas típicas** de tu nicho. Edítalas, agrega más, borra las que no aplican.

## Aprendizaje automático del bot

Si el bot recibe una pregunta y NO encuentra respuesta en la KB:

* La marca como "no respondida"
* Aparece en `/aprendizaje`
* Tú puedes revisarla y crear la entrada correspondiente

> Esto crea un loop: el bot aprende de las preguntas que no supo contestar.

## Buscar en la KB

Si tienes muchas entradas, hay buscador arriba.

## Exportar

CSV con todas tus preguntas/respuestas — útil para auditoría o migrar a otro sistema.

## Diferencia con Quick Replies

| Knowledge Base | Quick Replies |
|---|---|
| El bot la usa **automáticamente** | TÚ las usas manualmente al responder en chat |
| Pregunta-respuesta | Solo respuesta plantilla |
| Búsqueda semántica | Lista de plantillas |
| Para info de tu negocio | Para mensajes que TÚ mandas seguido |
