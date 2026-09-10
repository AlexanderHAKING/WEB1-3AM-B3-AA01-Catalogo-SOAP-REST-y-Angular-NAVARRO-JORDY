IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'CatalogoSOAPDB')
BEGIN
    CREATE DATABASE CatalogoSOAPDB;
END
GO

USE CatalogoSOAPDB;
GO

IF OBJECT_ID('dbo.Movimiento_Inventario', 'U') IS NOT NULL DROP TABLE dbo.Movimiento_Inventario;
IF OBJECT_ID('dbo.Producto', 'U') IS NOT NULL DROP TABLE dbo.Producto;
IF OBJECT_ID('dbo.Categoria', 'U') IS NOT NULL DROP TABLE dbo.Categoria;
GO

CREATE TABLE Categoria
(
    IdCategoria INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(80) NOT NULL,
    Descripcion NVARCHAR(200) NULL,
    Estado BIT NOT NULL DEFAULT 1
);
GO

CREATE TABLE Producto
(
    IdProducto INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL,
    Descripcion NVARCHAR(220) NULL,
    Precio DECIMAL(18,2) NOT NULL,
    Stock INT NOT NULL,
    Estado BIT NOT NULL DEFAULT 1,
    IdCategoria INT NOT NULL,
    CONSTRAINT FK_Producto_Categoria
        FOREIGN KEY (IdCategoria) REFERENCES Categoria(IdCategoria)
);
GO

CREATE TABLE Movimiento_Inventario
(
    IdMovimiento INT IDENTITY(1,1) PRIMARY KEY,
    IdProducto INT NOT NULL,
    TipoMovimiento NVARCHAR(20) NOT NULL,
    Cantidad INT NOT NULL,
    FechaMovimiento DATETIME NOT NULL DEFAULT GETDATE(),
    Observacion NVARCHAR(220) NULL,
    CONSTRAINT FK_Movimiento_Inventario_Producto
        FOREIGN KEY (IdProducto) REFERENCES Producto(IdProducto),
    CONSTRAINT CK_Movimiento_Inventario_Tipo
        CHECK (TipoMovimiento IN ('Entrada', 'Salida')),
    CONSTRAINT CK_Movimiento_Inventario_Cantidad
        CHECK (Cantidad > 0)
);
GO

INSERT INTO Categoria (Nombre, Descripcion, Estado) VALUES
('Papeleria', 'Utiles escolares y de oficina', 1),
('Tecnologia', 'Accesorios y equipos pequenos', 1),
('Hogar', 'Articulos para uso diario en casa', 1),
('Cuidado personal', 'Productos de aseo y bienestar', 1),
('Promociones', 'Categoria temporal para descuentos', 0);
GO

INSERT INTO Producto (Nombre, Descripcion, Precio, Stock, Estado, IdCategoria) VALUES
('Cuaderno universitario', 'Cuaderno de 100 hojas a cuadros', 2.25, 95, 1, 1),
('Esfero azul pack x3', 'Paquete de tres esferos punta fina', 1.40, 120, 1, 1),
('Mouse inalambrico', 'Mouse optico USB de bajo consumo', 12.99, 18, 1, 2),
('Memoria USB 64GB', 'Unidad USB 3.0 color negro', 8.50, 35, 1, 2),
('Organizador plastico', 'Caja modular para escritorio', 6.75, 27, 1, 3),
('Termo acero 750ml', 'Botella termica para bebidas frias o calientes', 18.75, 22, 1, 3),
('Jabon liquido 500ml', 'Jabon para manos aroma neutro', 3.60, 40, 1, 4),
('Toalla facial', 'Toalla pequena de algodon', 4.90, 16, 1, 4),
('Agenda 2026', 'Agenda semanal con pasta dura', 7.80, 9, 0, 1);
GO

INSERT INTO Movimiento_Inventario (IdProducto, TipoMovimiento, Cantidad, FechaMovimiento, Observacion) VALUES
(1, 'Entrada', 20, GETDATE(), 'Compra inicial para clases'),
(3, 'Salida', 2, GETDATE(), 'Venta mostrador'),
(4, 'Entrada', 10, GETDATE(), 'Reposicion de accesorios');
GO

SELECT
    p.IdProducto,
    p.Nombre AS Producto,
    p.Precio,
    p.Stock,
    p.Estado,
    c.Nombre AS Categoria
FROM Producto p
INNER JOIN Categoria c ON c.IdCategoria = p.IdCategoria;
GO

SELECT
    m.IdMovimiento,
    p.Nombre AS Producto,
    m.TipoMovimiento,
    m.Cantidad,
    m.FechaMovimiento,
    m.Observacion
FROM Movimiento_Inventario m
INNER JOIN Producto p ON p.IdProducto = m.IdProducto;
GO
