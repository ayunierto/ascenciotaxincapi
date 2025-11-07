# Zoom API - Problema de Permisos

## Error Detectado

```
Error Code: 4711
Message: "Invalid access token, does not contain scopes:[meeting:update:meeting:admin, meeting:update:meeting]."
```

## Problema

El token de acceso de Zoom no tiene los permisos (scopes) necesarios para actualizar reuniones.

## Solución

### 1. Acceder al Zoom App Marketplace

1. Ve a https://marketplace.zoom.us/
2. Inicia sesión con tu cuenta de Zoom
3. Ve a "Develop" > "Build App"

### 2. Configurar Scopes de tu App

1. Encuentra tu app existente o crea una nueva
2. Ve a la sección "Scopes"
3. Asegúrate de tener habilitados estos scopes:
   - `meeting:write:meeting` (para crear/actualizar reuniones)
   - `meeting:read:meeting` (para leer información de reuniones)
   - `meeting:delete:meeting` (para eliminar reuniones)

### 3. Regenerar Credenciales (si es necesario)

1. Si cambiaste los scopes, ve a "App Credentials"
2. Regenera el `Client Secret` si es necesario
3. Actualiza las variables de entorno:
   ```env
   ZOOM_ACCOUNT_ID=tu_account_id
   ZOOM_CLIENT_ID=tu_client_id
   ZOOM_CLIENT_SECRET=tu_nuevo_client_secret
   ```

### 4. Verificar Tipo de App

- Asegúrate de que tu app sea del tipo "Server-to-Server OAuth"
- Este tipo permite usar account credentials sin necesidad de autorización manual

## Notas Importantes

- Los cambios en scopes pueden tardar unos minutos en propagarse
- Después de cambiar scopes, reinicia la aplicación NestJS
- El error actual no afecta la actualización del calendario Google, solo Zoom

## Estado Actual

- ✅ Formato de fecha de Zoom corregido
- ✅ Calendario Google se actualiza independientemente de errores de Zoom
- ❌ Permisos de Zoom necesitan configuración manual en Marketplace
