# Sistema Contable - Servidor Java con MySQL

Este proyecto es la parte del servidor del Sistema Contable, ahora implementado en Java con conexión a MySQL.

## Requisitos previos

- Java JDK 11 o superior
- Maven
- MySQL Server 5.7 o superior

## Configuración de la base de datos

1. Asegúrate de tener MySQL instalado y en ejecución
2. Crea una base de datos llamada `sistema_contable`:

```sql
CREATE DATABASE IF NOT EXISTS sistema_contable;
```

3. Ejecuta el script de creación de tablas ubicado en `src/database/schema.mysql.sql`

## Configuración del proyecto

1. Edita el archivo `src/database/config.properties` para configurar la conexión a tu base de datos MySQL:

```properties
db.url=jdbc:mysql://localhost:3306/sistema_contable?useSSL=false&serverTimezone=UTC
db.username=tu_usuario
db.password=tu_contraseña
```

## Compilación y ejecución

### Compilar el proyecto

```bash
mvn clean package
```

### Ejecutar el servidor

```bash
java -jar target/sistema-contable-server-1.0-SNAPSHOT.jar
```

O también puedes ejecutar directamente la clase principal:

```bash
mvn exec:java -Dexec.mainClass="com.sistemacontable.Main"
```

## Estructura del proyecto

- `src/com/sistemacontable/Main.java`: Punto de entrada de la aplicación y configuración del servidor web
- `src/database/`: Clases para la conexión y gestión de la base de datos
  - `DatabaseConnection.java`: Gestiona la conexión a MySQL
  - `DatabaseManager.java`: Proporciona métodos para ejecutar consultas SQL
  - `dao/`: Contiene las clases DAO (Data Access Object) para cada entidad

## Migración desde SQLite

Este proyecto ha sido migrado desde SQLite a MySQL. Los principales cambios incluyen:

1. Reemplazo de better-sqlite3 por el driver JDBC de MySQL
2. Implementación de clases Java para la conexión y gestión de la base de datos
3. Creación de un nuevo esquema SQL compatible con MySQL

## API REST

El servidor expone los siguientes endpoints:

- `GET /api/status`: Verifica el estado del servidor
- `GET /api/transactions`: Obtiene todas las transacciones
- `GET /api/transactions/:id`: Obtiene una transacción por su ID
- `POST /api/transactions`: Crea una nueva transacción
- `PUT /api/transactions/:id`: Actualiza una transacción existente
- `DELETE /api/transactions/:id`: Elimina una transacción

## Notas adicionales

- El servidor se ejecuta por defecto en el puerto 3000
- CORS está configurado para permitir peticiones desde http://localhost:5173 (frontend)