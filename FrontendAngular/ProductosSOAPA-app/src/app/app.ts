import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogoExternoService } from './catalogo-externo.service';
import { CatalogoSoapService } from './catalogo-soap.service';
import { Categoria, MovimientoFormulario, MovimientoInventario, Producto, ProductoExterno } from './models';
import { MovimientoRestService } from './movimiento-rest.service';

type EstadoVista = 'todo' | 'activos' | 'inactivos';
type Vista = 'soap' | 'rest' | 'api';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  categorias: Categoria[] = [];
  productos: Producto[] = [];
  productosVista: Producto[] = [];
  movimientos: MovimientoInventario[] = [];
  productosExternos: ProductoExterno[] = [];

  cargando = false;
  guardando = false;
  mensaje = '';
  error = '';
  editando = false;
  editandoMovimiento = false;
  idMovimientoEditando = 0;
  estadoVista: EstadoVista = 'todo';
  vista: Vista = 'soap';

  filtroCategoria = 0;
  precioMinimo: number | null = null;
  precioMaximo: number | null = null;

  formulario: Producto = this.productoVacio();
  movimientoForm: MovimientoFormulario = this.movimientoVacio();
  busquedaExterna = 'phone';
  categoriaExterna = 'smartphones';
  categoriasExternas = ['smartphones', 'laptops', 'beauty', 'groceries', 'home-decoration', 'furniture'];
  productoLocalComparar = 0;
  productoExternoComparar = 0;
  cargandoApi = false;
  errorApi = '';

  constructor(
    private readonly catalogoService: CatalogoSoapService,
    private readonly movimientoService: MovimientoRestService,
    private readonly catalogoExternoService: CatalogoExternoService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarTodo();
    this.buscarEnCatalogoExterno();
  }

  cargarTodo(): void {
    this.cargando = true;
    this.error = '';

    this.catalogoService.obtenerCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
        this.cargarProductos();
      },
      error: () => this.marcarError('No se pudieron cargar las categorias. Revisa que el servicio SOAP este ejecutandose.'),
    });
  }

  cargarProductos(): void {
    this.cargando = true;
    this.catalogoService.obtenerProductos().subscribe({
      next: (productos) => {
        this.productos = productos;
        if (!this.movimientoForm.idProducto) this.movimientoForm.idProducto = productos[0]?.idProducto ?? 0;
        this.aplicarVista();
        this.cargarMovimientos();
        this.cargando = false;
        this.actualizarPantalla();
      },
      error: () => this.marcarError('No se pudieron cargar los productos desde el servicio SOAP.'),
    });
  }

  filtrarPorCategoria(): void {
    if (!this.filtroCategoria) {
      this.cargarProductos();
      return;
    }

    this.cargando = true;
    this.catalogoService.obtenerProductosPorCategoria(Number(this.filtroCategoria)).subscribe({
      next: (productos) => {
        this.productos = productos;
        this.aplicarVista();
        this.cargando = false;
        this.actualizarPantalla();
      },
      error: () => this.marcarError('No se pudo filtrar por categoria.'),
    });
  }

  filtrarPorPrecio(): void {
    if (this.precioMinimo === null || this.precioMaximo === null) {
      this.error = 'Ingresa precio minimo y precio maximo.';
      return;
    }

    this.cargando = true;
    this.catalogoService.obtenerProductosPorPrecio(this.precioMinimo, this.precioMaximo).subscribe({
      next: (productos) => {
        this.productos = productos;
        this.aplicarVista();
        this.cargando = false;
        this.actualizarPantalla();
      },
      error: () => this.marcarError('No se pudo filtrar por precio.'),
    });
  }

  limpiarFiltros(): void {
    this.filtroCategoria = 0;
    this.precioMinimo = null;
    this.precioMaximo = null;
    this.estadoVista = 'todo';
    this.cargarProductos();
  }

  aplicarVista(): void {
    this.productosVista = this.productos.filter((producto) => {
      if (this.estadoVista === 'activos') return producto.estado;
      if (this.estadoVista === 'inactivos') return !producto.estado;
      return true;
    });
  }

  nuevoProducto(): void {
    this.editando = false;
    this.formulario = this.productoVacio();
    this.mensaje = '';
    this.error = '';
  }

  editar(producto: Producto): void {
    this.editando = true;
    this.formulario = { ...producto };
    this.mensaje = '';
    this.error = '';
  }

  guardar(): void {
    if (this.guardando) {
      return;
    }

    if (!this.formulario.nombre.trim()) {
      this.error = 'El nombre del producto es obligatorio.';
      return;
    }

    if (!this.formulario.idCategoria) {
      this.error = 'Selecciona una categoria.';
      return;
    }

    this.guardando = true;
    this.mensaje = '';
    this.error = '';

    const estabaEditando = this.editando;
    const accion = this.editando
      ? this.catalogoService.actualizarProducto(this.formulario)
      : this.catalogoService.agregarProducto(this.formulario);

    accion.subscribe({
      next: (producto) => {
        if (!producto) {
          this.marcarError('El servicio no devolvio el producto guardado.');
          return;
        }

        this.nuevoProducto();
        this.mensaje = estabaEditando ? 'Producto actualizado correctamente.' : 'Producto agregado correctamente.';
        this.guardando = false;
        this.cargarProductos();
      },
      error: () => this.marcarError('No se pudo guardar el producto.'),
    });
  }

  eliminar(producto: Producto): void {
    this.catalogoService.eliminarProducto(producto.idProducto).subscribe({
      next: (ok) => {
        this.mensaje = ok ? 'Producto eliminado correctamente.' : 'No se encontro el producto.';
        this.cargarProductos();
      },
      error: () => this.marcarError('No se pudo eliminar el producto.'),
    });
  }

  cargarMovimientos(): void {
    this.movimientoService.obtenerMovimientos().subscribe({
      next: (movimientos) => {
        this.movimientos = movimientos;
        this.actualizarPantalla();
      },
      error: () => this.marcarError('No se pudieron cargar los movimientos REST.'),
    });
  }

  guardarMovimiento(): void {
    if (!this.movimientoForm.idProducto) {
      this.error = 'Selecciona un producto para el movimiento.';
      return;
    }

    if (this.movimientoForm.cantidad <= 0) {
      this.error = 'La cantidad del movimiento debe ser mayor que cero.';
      return;
    }

    const accion = this.editandoMovimiento
      ? this.movimientoService.actualizarMovimiento(this.idMovimientoEditando, this.movimientoForm)
      : this.movimientoService.agregarMovimiento(this.movimientoForm);

    accion.subscribe({
      next: () => {
        this.mensaje = this.editandoMovimiento ? 'Movimiento actualizado correctamente.' : 'Movimiento registrado correctamente.';
        this.nuevoMovimiento();
        this.cargarProductos();
      },
      error: (respuesta) => this.marcarError(respuesta.error || 'No se pudo guardar el movimiento.'),
    });
  }

  editarMovimiento(movimiento: MovimientoInventario): void {
    this.editandoMovimiento = true;
    this.idMovimientoEditando = movimiento.idMovimiento;
    this.movimientoForm = {
      idProducto: movimiento.idProducto,
      tipoMovimiento: movimiento.tipoMovimiento,
      cantidad: movimiento.cantidad,
      observacion: movimiento.observacion || '',
    };
    this.mensaje = '';
    this.error = '';
  }

  eliminarMovimiento(movimiento: MovimientoInventario): void {
    this.movimientoService.eliminarMovimiento(movimiento.idMovimiento).subscribe({
      next: () => {
        this.mensaje = 'Movimiento eliminado correctamente.';
        this.cargarProductos();
      },
      error: (respuesta) => this.marcarError(respuesta.error || 'No se pudo eliminar el movimiento.'),
    });
  }

  nuevoMovimiento(): void {
    this.editandoMovimiento = false;
    this.idMovimientoEditando = 0;
    this.movimientoForm = this.movimientoVacio();
  }

  buscarEnCatalogoExterno(): void {
    if (!this.busquedaExterna.trim()) {
      this.errorApi = 'Ingresa un texto para buscar en la API externa.';
      return;
    }

    this.cargandoApi = true;
    this.errorApi = '';

    this.catalogoExternoService.buscarProductos(this.busquedaExterna).subscribe({
      next: (productos) => {
        this.productosExternos = productos.slice(0, 6);
        this.cargandoApi = false;
        if (!this.productosExternos.length) this.errorApi = 'La API no devolvio productos para esa busqueda.';
        this.actualizarPantalla();
      },
      error: () => {
        this.cargandoApi = false;
        this.errorApi = 'No se pudo consultar la API externa en este momento.';
        this.actualizarPantalla();
      },
    });
  }

  buscarCategoriaExterna(): void {
    this.busquedaExterna = this.categoriaExterna;
    this.buscarEnCatalogoExterno();
  }

  cambiarVista(vista: Vista): void {
    this.vista = vista;
    this.mensaje = '';
    this.error = '';
    this.errorApi = '';
  }

  productoComparadoLocal(): Producto | undefined {
    return this.productos.find((producto) => producto.idProducto === Number(this.productoLocalComparar));
  }

  productoComparadoExterno(): ProductoExterno | undefined {
    return this.productosExternos.find((producto) => producto.id === Number(this.productoExternoComparar));
  }

  nombreCategoria(idCategoria: number): string {
    return this.categorias.find((categoria) => categoria.idCategoria === Number(idCategoria))?.nombre ?? 'Sin categoria';
  }

  get totalActivos(): number {
    return this.productos.filter((producto) => producto.estado).length;
  }

  get inventarioTotal(): number {
    return this.productos.reduce((total, producto) => total + producto.stock, 0);
  }

  private productoVacio(): Producto {
    return {
      idProducto: 0,
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      estado: true,
      idCategoria: this.categorias[0]?.idCategoria ?? 1,
    };
  }

  private movimientoVacio(): MovimientoFormulario {
    return {
      idProducto: this.productos[0]?.idProducto ?? 0,
      tipoMovimiento: 'Entrada',
      cantidad: 1,
      observacion: '',
    };
  }

  private marcarError(mensaje: string): void {
    this.error = mensaje;
    this.cargando = false;
    this.guardando = false;
    this.actualizarPantalla();
  }

  private actualizarPantalla(): void {
    this.cdr.detectChanges();
  }
}
