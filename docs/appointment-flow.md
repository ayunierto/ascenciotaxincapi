# Diagramas de Flujo del Sistema de Citas

## 1. Flujo de Creación de Citas

```mermaid
flowchart TD
    A[Cliente Solicita Cita] --> B[Validar Datos de Entrada]
    B --> C{Validar TimeZone}
    C -->|Inválida| D[Error: TimeZone Inválida]
    C -->|Válida| E[Obtener Servicio y Staff]

    E --> F[Validar Fechas]
    F -->|Error| G[Error: Fechas Inválidas]
    F -->|Válidas| H[Validar Horario Laboral]

    H -->|Fuera de Horario| I[Error: Fuera de Horario]
    H -->|En Horario| J{Verificar Conflictos}

    J -->|Conflicto| K[Error: Horario No Disponible]
    J -->|Disponible| L[Crear Reunión Zoom]

    L --> M[Crear Evento Calendar]
    M --> N[Guardar Cita]
    N --> O[Enviar Notificaciones]
    O --> P[Email al Cliente]
    O --> Q[Email al Staff]

    P --> R[Fin]
    Q --> R
```

## 2. Flujo de Validación de Horarios

```mermaid
flowchart LR
    A[Inicio Validación] --> B{Verificar Schedule}
    B -->|No Existe| C[Error: No hay horario]
    B -->|Existe| D{Validar Hora Inicio}

    D -->|Antes de Horario| E[Error: Muy Temprano]
    D -->|En Horario| F{Validar Hora Fin}

    F -->|Después de Horario| G[Error: Muy Tarde]
    F -->|En Horario| H[Horario Válido]
```

## 3. Flujo de Actualización de Citas

```mermaid
flowchart TD
    A[Solicitud de Actualización] --> B{Cita Existe?}
    B -->|No| C[Error: No Encontrada]
    B -->|Sí| D{Cambio de Horario?}

    D -->|No| E[Actualizar Datos Básicos]
    D -->|Sí| F[Validar Nuevo Horario]

    F --> G{Validar Disponibilidad}
    G -->|No Disponible| H[Error: Conflicto]
    G -->|Disponible| I[Actualizar Zoom]

    I --> J[Actualizar Calendar]
    J --> K[Guardar Cambios]
    E --> K

    K --> L[Fin]
```

## 4. Estados de la Cita y Transiciones

```mermaid
stateDiagram-v2
    [*] --> Pendiente: Crear Cita
    Pendiente --> Completada: Fecha Pasada
    Pendiente --> Cancelada: Cancelar
    Completada --> [*]
    Cancelada --> [*]
```

## 5. Componentes del Sistema

```mermaid
graph TD
    A[Cliente API] --> B[AppointmentsService]
    B --> C[AppointmentHelper]
    B --> D[ZoomService]
    B --> E[CalendarService]
    B --> F[NotificationService]

    C --> G[Schedule Repository]
    C --> H[Staff Service]
    C --> I[Services Service]

    B --> J[Appointment Repository]
    B --> K[Settings Service]

    subgraph External Services
        D
        E
        F
    end

    subgraph Helpers
        C
    end

    subgraph Data Layer
        G
        H
        I
        J
        K
    end
```
