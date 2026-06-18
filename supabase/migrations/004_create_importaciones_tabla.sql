-- Tabla para historial de importaciones de productos desde Excel
create table if not exists importaciones_productos (
  id                     text primary key,
  archivo_nombre         text not null,
  total_filas            integer default 0,
  productos_creados      integer default 0,
  productos_actualizados integer default 0,
  productos_ignorados    integer default 0,
  categorias_creadas     integer default 0,
  estado                 text default 'completado',   -- 'completado' | 'con_errores'
  errores                text,                        -- JSON array de errores
  creado_en              timestamptz default now(),
  usuario_id             text
);

-- Índice para ordenar por fecha descendente (consulta más común)
create index if not exists importaciones_productos_creado_en_idx
  on importaciones_productos (creado_en desc);

-- RLS: solo usuarios autenticados pueden leer/insertar
alter table importaciones_productos enable row level security;

create policy "Admin puede leer importaciones"
  on importaciones_productos for select
  using (true);

create policy "Admin puede insertar importaciones"
  on importaciones_productos for insert
  with check (true);
