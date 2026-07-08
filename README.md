# Programación de videojuegos I

## Last Bastion

**Last Bastion** es un juego tipo TD (Tower Defense) y de supervivencia (Survival) desarrollado enteramente en Vanilla JavaScript haciendo uso de la biblioteca de renderizado web **PIXI.js**. 

El juego cuenta con un motor y una arquitectura de componentes personalizados basados en un sistema híbrido **ECS (Entity-Component-System)** y POO clásica para lograr rendimiento y escalabilidad.

---

## Demo Online

[Jugar Last Bastion](https://lastbastion.netlify.app/)

---

## 📖 Descripción del Juego

En *Last Bastion*, el jugador toma el control de un superviviente en un escenario post-apocalíptico que debe proteger la última base central o "Bastión" contra oleadas de enemigos (Zombies) cada vez más difíciles y masivas. 
Si el jugador pierde toda su salud o la del Bastión llega a 0, la partida termina.

---

## ⚙ Mecánicas

Las mecánicas son las interacciones y sistemas que rigen el mundo de *Last Bastion*.
- **Movimiento y Combate Libre**: El jugador puede desplazarse por todo el mapa de juego (`WASD`) y apuntar y disparar su arma primaria libremente con el cursor (`Click Izquierdo`).
- **Construcción y Economía**: Al derrotar enemigos, el jugador recibe dinero. Este dinero puede usarse para construir tres tipos de torretas (`Ametralladora`, `Cañón`, `Francotirador`) en espacios predeterminados (`Slots`), venderlas, o plantar explosivos por el mapa.
- **Sistema de Mejoras (Upgrades)**: Las torretas y el Bastión principal pueden ser mejoradas usando dinero para incrementar sus atributos principales (Daño, Rango, Cadencia de tiro) con un costo porcentual por cada mejora.
- **Oleadas y Dificultad Dinámica**: Los enemigos aparecen en grupos organizados (Oleadas). A medida que avanza el juego, el número y resistencia de los enemigos aumenta, obligando al jugador a adaptar sus defensas.
- **Físicas y Colisiones Continuas (CCD)**: Un sistema de detección que previene que entidades y proyectiles rápidos atraviesen las paredes o a los enemigos, garantizando ataques precisos.

---

## 🎮 Dinámicas

Las dinámicas son los comportamientos emergentes producto de cómo los jugadores interactúan con las mecánicas a lo largo de las partidas.
- **Gestión de Riesgo y Economía**: El jugador debe decidir constantemente si invierte en más defensas dispersas o en concentrar las mejoras en un par de torretas estratégicas. A su vez, los explosivos brindan daño masivo por bajo costo pero son de un solo uso.
- **Supervivencia Activa**: Al diferencia de un Tower Defense tradicional donde el jugador solo observa, aquí participa activamente. El jugador puede servir como carnada (kiting) para atraer zombies a zonas de explosivos (`C4` o `Minas`), salvando al Bastión en los momentos de mayor peligro.
- **Micro-gestión de Posicionamiento**: Dado que hay turrets con mucho rango (Francotiradores) y otras con área de daño (Cañones), dónde se colocan resulta clave para maximizar el daño por segundo (DPS) conjunto.

---

## 👾 Lista de Entidades Principales

El juego cuenta con los siguientes tipos de entidades administradas dentro del motor y su ECS:

### Aliados y Defensas
- **Jugador (`PlayerEntity`)**: Avatar controlado por el usuario. Administra su propia salud, movimiento, animación y lógica de disparo primario.
- **Bastión (`FortressEntity`)**: Edificio central que el jugador debe defender. Se regenera pasivamente, ataca enemigos en su rango, y posee estadísticas que pueden mejorarse.
- **Torreta (`TurretEntity / ECS`)**: Existen varios ensamblados (`Ametralladora`, `Cañón`, `Francotirador`), cada uno regido por una IA (`TurretAIComponent`) que detecta enemigos cercanos, apunta y dispara balas.
- **Espacios (`TurretSlotEntity`)**: Ubicaciones en el mapa que interactúan con el ratón del jugador para permitir la compra o venta de torretas.

### Enemigos
- **Zombie (`ZombieEntity / ECS`)**: Criaturas hostiles generadas por los ensambladores de las oleadas. Usan máquinas de estados finitos (`FSM`) para alternar entre estados: `IdleState`, `ChaseState` y `AttackState`. Cuentan con un sistema inteligente de enjambre (Boids) y "pathfinding" básico.

### Proyectiles y Efectos
- **Bala (`Bullet / ECS`)**: Instanciada por el jugador o las torretas. Puede infligir daño a un solo objetivo o causar explosiones (`splashRadius`) como en el caso del cañón.
- **Explosivos (`ExplosiveEntity`)**: Ítems plantados por el jugador (`C4`, `Minas`, `Bombas de tiempo`) con distintos métodos de detonación, infligen daño masivo en área.
- **Efecto de Explosión (`ExplosionEffectEntity`)**: Representación visual y sonora temporal de cualquier detonación en el juego.
