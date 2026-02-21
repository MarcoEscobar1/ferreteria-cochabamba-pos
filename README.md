# Ferretería Cochabamba — Sistema POS

Sistema de Punto de Venta completo para Ferretería Cochabamba, desarrollado con React 18, Vite 5, TailwindCSS, Zustand y Supabase.

## Stack Tecnológico

| Tecnología | Uso |
|---|---|
| React 18 + Vite 5 | Frontend SPA |
| TailwindCSS 3 | Estilos y diseño responsivo |
| React Router v6 | Enrutamiento SPA |
| Zustand | Estado global (auth, carrito) |
| Supabase JS Client v2 | Backend (PostgreSQL, Auth, Storage) |
| React Hook Form + Zod | Formularios y validación |
| react-to-print | Impresión de recibos |
| jsPDF + jspdf-autotable | Exportación a PDF |
| SheetJS (xlsx) | Exportación a Excel |
| react-hot-toast | Notificaciones |
| react-icons | Iconografía |
| date-fns | Manejo de fechas |

## Requisitos Previos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com)

## Configuración

### 1. Clonar e instalar

```bash
git clone <repo-url>
cd ferreteria-cochabamba-pos
npm install
```

### 2. Configurar Supabase

1. Crea un nuevo proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Configura la base de datos según las instrucciones proporcionadas por el desarrollador
3. Copia la URL y la Anon Key desde **Settings > API**

### 3. Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### 4. Ejecutar

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Estructura del Proyecto

```
src/
├── api/
│   └── supabaseApi.js          # Funciones de acceso a Supabase
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.jsx  # Rutas protegidas por rol
│   ├── layout/
│   │   ├── AdminLayout.jsx     # Layout con sidebar admin
│   │   └── EmployeeLayout.jsx  # Layout con sidebar empleado
│   ├── pos/
│   │   └── ReceiptModal.jsx    # Modal de recibo imprimible
│   └── ui/
│       ├── ConfirmDialog.jsx   # Diálogo de confirmación
│       ├── EmptyState.jsx      # Estado vacío
│       ├── Modal.jsx           # Modal reutilizable
│       ├── PageHeader.jsx      # Encabezado de página
│       ├── Spinner.jsx         # Indicador de carga
│       └── StockBadge.jsx      # Badge de estado de stock
├── lib/
│   └── supabaseClient.js       # Cliente Supabase configurado
├── pages/
│   ├── admin/
│   │   ├── CategoriesPage.jsx  # CRUD Categorías
│   │   ├── DashboardPage.jsx   # Dashboard con métricas
│   │   ├── EmployeesPage.jsx   # Gestión de empleados
│   │   ├── ProductsPage.jsx    # CRUD Productos
│   │   ├── ReportsPage.jsx     # Reportes exportables
│   │   └── SuppliersPage.jsx   # CRUD Proveedores
│   ├── employee/
│   │   ├── POSPage.jsx         # Pantalla punto de venta
│   │   └── SalesHistoryPage.jsx# Historial de ventas
│   └── LoginPage.jsx           # Inicio de sesión
├── stores/
│   ├── authStore.js            # Estado de autenticación
│   └── cartStore.js            # Estado del carrito
├── utils/
│   ├── excelExport.js          # Exportación a Excel
│   ├── formatters.js           # Formateadores (moneda, fecha)
│   └── pdfExport.js            # Generación de PDFs
├── App.jsx                     # Rutas principales
├── index.css                   # Estilos Tailwind + componentes
└── main.jsx                    # Punto de entrada
```

## Módulos

### Módulo Empleado (POS)
- **Punto de Venta**: Búsqueda de productos por nombre/categoría, tarjetas con imagen/precio/stock, carrito lateral, campo de cliente opcional, procesamiento de venta
- **Recibo**: Imprimible y descargable en PDF con datos completos (empresa, venta, empleado, cliente, tabla de productos, total en BOB)
- **Historial**: Ventas propias con filtro por fechas

### Módulo Admin
- **Dashboard**: Métricas del día (ventas, transacciones, productos), alertas de stock bajo/agotado, ventas recientes
- **Productos**: CRUD completo, subida de imagen a Storage, stock de solo lectura en edición, deshabilitar sin eliminar
- **Categorías**: CRUD con soft-delete
- **Proveedores**: CRUD con información de contacto
- **Empleados**: Invitación vía email, deshabilitar = ban en Auth
- **Reportes**: General, por empleado, por fecha, inventario — todos exportables a PDF y Excel

## Reglas de Negocio

- Stock controlado por funciones transaccionales del lado del servidor
- Soft-delete en todas las entidades (ningún registro se elimina)
- Roles: `admin` (acceso total) y `employee` (solo POS)
- Row Level Security en toda la base de datos

## Licencia

Uso privado — Ferretería Cochabamba
