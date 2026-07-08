# Bitácora del Proyecto (Changelog)

Este documento registra la evolución arquitectónica y el progreso del desarrollo de *Bastion*, integrando el historial de commits y las distintas ramas trabajadas a lo largo de las fases de programación.

---

## Evolución de las Ramas

### Rama `main` (Fase Inicial)
El proyecto comenzó estableciendo la arquitectura de base, donde se implementaron las mecánicas iniciales del juego orientadas a objetos.
- **Base funcional del juego**: Creación de las bases del motor.
- **Sistemas base**: Interfaz gráfica, menús, y manejo de entidades. 
- **Entidades iniciales**: Jugador (Player), sistema de input (Input System), HUD básico, y lógica de explosivos tipo C4 (`c4 logic`).
- **Sistema de Ataque y Zombies**: Se implementó el sistema de combate, estado y movimiento (FSM) del zombie, y se integró la lógica de ataque y rangos.

### Rama `engine`
Surgió la necesidad de crear un motor propio y modular para manejar aspectos complejos como colisiones.
- **Scene + CollisionSystem**: Se introdujo el concepto de "Scene" (Escena) y un sistema avanzado de colisiones continuas para mejorar las físicas y evitar bugs de atravesamiento.

### Rama `engine-ecs` y `engine-ecs-v2` (Evolución a ECS)
A medida que el proyecto crecía, la programación orientada a objetos pura empezó a mostrar limitaciones (alto acoplamiento).
- **Arquitectura ECS (Entity-Component-System)**: Se implementó un motor completo basado en Componentes para separar la lógica de los datos. Se definió `World`, componentes de entidades y sistemas aislados.
- Se reescribió gran parte del renderizado y el control de las entidades para integrarse bajo esta nueva arquitectura híbrida (combinando entidades clásicas y el ECS).

### Rama `develop`
En esta rama se consolidaron los cambios preliminares del motor para preparar la reestructuración completa del juego sobre el nuevo ECS.

### Rama `develop2` (Integración Actual)
Rama actual donde se realizó la migración del juego completo y los toques finales interactuando a través del chat, consolidando el trabajo previo.
- **Reestructuración (Partes 1, 2 y 3)**: Migración completa de torretas, zombies, balas y física a sistemas y componentes de ECS. Se modularizó el código en carpetas de `assemblers`, `systems`, y `components`.
- **Integración de Sonido y Ambientes**: Se añadieron músicas intercaladas y efectos sonoros espaciales para el juego y alertas para oleadas.
- **Correcciones y Refinamiento (Chat)**:
  - Arreglo de los **explosivos** y lógicas de daño en área.
  - Costo de **mejora de Bastión y Torretas**: cambiado a incrementos proporcionales (interés compuesto).
  - Modales visuales (Volumen, Menú de Pausa) ordenados mediante **zIndex** para siempre superponerse al juego y evitar que se bloqueen.
  - Corrección de bugs como sprites "fantasma" de torretas vendidas, y objetivos parpadeantes de torretas al disparar.
  - Documentación integral mediante **JSDoc** para todos los sistemas y entidades construidas.

---

## Historial Resumido de Versiones (Commits Clave)

- `1527f50` **(develop2)** Sonido ambiente + fixes menores.
- `84b63be` **(develop2)** Reestructuración parte 3 (Finalización de migración a ECS).
- `14c4ba5` **(develop2)** Reestructuración (Lógica, UI e Input adaptados).
- `c4caa92` **(develop2)** Fix explosivos (Daño de C4 y Minas terrestres funcional).
- `d455fd4` **(engine-ecs-v2)** Implementación de la Arquitectura Core de ECS (Entity-Component-System).
- `2e1b1ea` **(engine)** Scene + CollisionSystem integrados.
- `2a18fb6` **(main)** Lógica de C4 y FSM base del zombie implementada.
- `591bec2` **(main)** Commit Base del proyecto.
