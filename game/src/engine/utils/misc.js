// src/engine/utils/misc.js
/**
 * Crea una función que se ejecutará después de que haya pasado un tiempo específico desde la última vez que se llamó.
 * Esto es útil para limitar la frecuencia de ejecución de una función, como en el caso de eventos de entrada o actualizaciones.
 * @param {Function} func - La función a ejecutar después del retraso.
 * @param {number} wait - El tiempo de espera en milisegundos.
 * @return {Function} Una función que, cuando se llama, reinicia el temporizador y ejecuta func después de wait milisegundos.
 */
export function debounce(func, wait) {
    let timeout;

    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}