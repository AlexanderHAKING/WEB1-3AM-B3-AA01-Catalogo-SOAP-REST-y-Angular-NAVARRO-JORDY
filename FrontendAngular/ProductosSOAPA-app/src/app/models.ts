export interface Categoria {
  idCategoria: number;
  nombre: string;
  descripcion: string;
  estado: boolean;
}

export interface Producto {
  idProducto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  estado: boolean;
  idCategoria: number;
}

export interface MovimientoInventario {
  idMovimiento: number;
  idProducto: number;
  producto: string;
  tipoMovimiento: string;
  cantidad: number;
  observacion: string;
  fechaMovimiento: string;
}

export interface MovimientoFormulario {
  idProducto: number;
  tipoMovimiento: string;
  cantidad: number;
  observacion: string;
}

export interface ProductoExterno {
  id: number;
  title: string;
  category: string;
  price: number;
  thumbnail: string;
  brand?: string;
}
