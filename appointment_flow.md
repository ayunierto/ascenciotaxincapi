# Sistema de reserva de citas.

## Caracteristicas principales.

- Un miembro del staff puede ofertar uno varios servicios.
- Cada miembro del staff tiene un horario de trabajo.
- Se deben registrar las citas en la base de datos del sistema y en un calendario global de la empresa (Google Calendar) para evitar solapamientos entre las citas reservadas en la pagina web de la empresa.
- Los eventos del calendario se leeran para consultar la disponiblidad.

## Flujo de una cita.

1. Un usuario elije un servicio desde una lista.
   - El usuario envia una fecha en fomato ISO8601 (con horas y minutos) para determinar el dia de la semana del horario del staff. Ya que el usuario puede estar en una zona horaria diferente.
2. El sistema debe proporcionar al usuario los espacios disponibles para agendar la cita de todos los miembros del staff para el servicio seleccionado.
   - El sistema debe comprobar la disponiblidad de cada miembro del staff segun su horario de trabajo.
   - EL sistema debe comprobar citas ya reservadas en la base de datos del sistema.
   - El sistema debe comprobar el calendario de la empresa para evitar que el miembro del staff tenga alguna cita agendada desde la pagina web u otro evento que no sea una cita, Ej: Horario de almuerzo. LLevar al niño a la escuela.
3. El usuario debe poder filtrar espacios disponibles por miembro del staff.
4. Se le debe mostrar al usuario un resumen de las preferencias seleccionadas en la cita.
   - Se debe mostrar fecha y hora de la cita.
   - Se debe mostrar miembro del staff seleccionado o el miembro del staff al que corresponde el espacio seleccionado en el caso de no haber seleccionado ningun miembro del staff.
   - Se debe mostrar direccion en caso de que la cita no sea online.
   - Comentarios para la empresa en caso de haberlos hecho.

## Enpoints
