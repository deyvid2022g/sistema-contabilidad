# Sistema de Contabilidad

## Descripción

Sistema de Contabilidad es una aplicación web moderna desarrollada para gestionar las finanzas de pequeñas y medianas empresas. Ofrece una interfaz intuitiva para el seguimiento de transacciones, facturas, cuentas, presupuestos y generación de informes financieros.

## Características Principales

- **Dashboard interactivo**: Visualización de resúmenes financieros y gráficos
- **Gestión de transacciones**: Registro y seguimiento de ingresos y gastos
- **Facturación**: Creación y gestión de facturas para clientes
- **Cuentas por pagar**: Seguimiento de facturas de proveedores
- **Gestión de cuentas bancarias**: Administración de múltiples cuentas (banco, efectivo, crédito, inversión)
- **Presupuestos**: Creación y seguimiento de presupuestos
- **Clientes y proveedores**: Base de datos de contactos comerciales
- **Categorías**: Organización de transacciones por categorías
- **Informes financieros**: Generación de reportes de ingresos/gastos, balance general, flujo de caja e impuestos
- **Exportación de datos**: Exportación de informes en formato PDF
- **Sistema de notificaciones**: Alertas para saldos bajos, facturas pendientes y más
- **Control de acceso por roles**: Diferentes niveles de permisos (administrador, contador, visualizador)

## Tecnologías Utilizadas

- **Frontend**: React, TypeScript
- **Estilos**: TailwindCSS
- **Gráficos**: Chart.js, react-chartjs-2
- **Formularios**: react-hook-form
- **Enrutamiento**: react-router-dom
- **Exportación de datos**: jsPDF, ExcelJS
- **Herramientas de desarrollo**: Vite, ESLint

## Requisitos Previos

- Node.js (versión 16 o superior)
- npm o yarn

## Instalación

1. Clone el repositorio:
   ```bash
   git clone [url-del-repositorio]
   cd sistema-contabilidad
   ```

2. Instale las dependencias:
   ```bash
   npm install
   # o con yarn
   yarn
   ```

3. Inicie el servidor de desarrollo:
   ```bash
   npm run dev
   # o con yarn
   yarn dev
   ```

4. Abra su navegador y vaya a `http://localhost:5173` (o el puerto que indique la consola)

## Compilación para Producción

```bash
# Compilar para producción
npm run build
# o con yarn
yarn build

# Vista previa de la versión de producción
npm run preview
# o con yarn
yarn preview
```

## Usuarios Predeterminados

La aplicación viene con dos usuarios predefinidos para pruebas:

1. **Administrador**
   - Email: admin@ejemplo.com
   - Contraseña: admin123
   - Acceso completo a todas las funcionalidades

2. **Contador**
   - Email: contador@ejemplo.com
   - Contraseña: contador123
   - Acceso a la mayoría de las funcionalidades excepto configuraciones avanzadas

## Estructura del Proyecto

```
src/
├── components/     # Componentes reutilizables
├── context/        # Contextos de React (Auth, Data, Notification)
├── pages/          # Páginas de la aplicación
├── types/          # Definiciones de tipos TypeScript
├── utils/          # Funciones de utilidad
├── App.tsx         # Componente principal y configuración de rutas
└── main.tsx        # Punto de entrada
```

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - vea el archivo LICENSE para más detalles.

## Contacto

Para preguntas o soporte, por favor contacte al equipo de desarrollo.