import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Categoria, Producto } from './models';

@Injectable({
  providedIn: 'root',
})
export class CatalogoSoapService {
  private readonly url = 'http://localhost:5232/ProductoService.svc';

  constructor(private readonly http: HttpClient) {}

  obtenerCategorias(): Observable<Categoria[]> {
    return this.enviar('ObtenerCategorias', this.envelope('<temp:ObtenerCategorias/>'))
      .pipe(map((xml) => this.leerCategorias(xml)));
  }

  obtenerProductos(): Observable<Producto[]> {
    return this.enviar('ObtenerProductos', this.envelope('<temp:ObtenerProductos/>'))
      .pipe(map((xml) => this.leerProductos(xml)));
  }

  obtenerProducto(id: number): Observable<Producto | null> {
    const body = this.envelope(`
      <temp:ObtenerProducto>
        <temp:id>${id}</temp:id>
      </temp:ObtenerProducto>
    `);

    return this.enviar('ObtenerProducto', body).pipe(map((xml) => this.leerProducto(xml)));
  }

  agregarProducto(producto: Producto): Observable<Producto | null> {
    const body = this.envelope(`
      <temp:AgregarProducto>
        <temp:producto>
          ${this.productoXml(producto, false)}
        </temp:producto>
      </temp:AgregarProducto>
    `);

    return this.enviar('AgregarProducto', body).pipe(map((xml) => this.leerProducto(xml)));
  }

  actualizarProducto(producto: Producto): Observable<Producto | null> {
    const body = this.envelope(`
      <temp:ActualizarProducto>
        <temp:producto>
          ${this.productoXml(producto, true)}
        </temp:producto>
      </temp:ActualizarProducto>
    `);

    return this.enviar('ActualizarProducto', body).pipe(map((xml) => this.leerProducto(xml)));
  }

  eliminarProducto(id: number): Observable<boolean> {
    const body = this.envelope(`
      <temp:EliminarProducto>
        <temp:id>${id}</temp:id>
      </temp:EliminarProducto>
    `);

    return this.enviar('EliminarProducto', body).pipe(
      map((xml) => this.valorDe(this.documento(xml), 'EliminarProductoResult') === 'true'),
    );
  }

  obtenerProductosPorPrecio(precioMinimo: number, precioMaximo: number): Observable<Producto[]> {
    const body = this.envelope(`
      <temp:ObtenerProductosPorPrecio>
        <temp:precioMinimo>${precioMinimo}</temp:precioMinimo>
        <temp:precioMaximo>${precioMaximo}</temp:precioMaximo>
      </temp:ObtenerProductosPorPrecio>
    `);

    return this.enviar('ObtenerProductosPorPrecio', body).pipe(map((xml) => this.leerProductos(xml)));
  }

  obtenerProductosPorCategoria(idCategoria: number): Observable<Producto[]> {
    const body = this.envelope(`
      <temp:ObtenerProductosPorCategoria>
        <temp:idCategoria>${idCategoria}</temp:idCategoria>
      </temp:ObtenerProductosPorCategoria>
    `);

    return this.enviar('ObtenerProductosPorCategoria', body).pipe(map((xml) => this.leerProductos(xml)));
  }

  private enviar(operacion: string, body: string): Observable<string> {
    const headers = new HttpHeaders({
      'Content-Type': 'text/xml; charset=utf-8',
      SOAPAction: `"http://tempuri.org/IProductoService/${operacion}"`,
    });

    return this.http.post(this.url, body, { headers, responseType: 'text' });
  }

  private envelope(contenido: string): string {
    return `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:temp="http://tempuri.org/">
        <soapenv:Header/>
        <soapenv:Body>
          ${contenido}
        </soapenv:Body>
      </soapenv:Envelope>
    `.trim();
  }

  private productoXml(producto: Producto, incluirId: boolean): string {
    return `
      <temp:Descripcion>${this.escapar(producto.descripcion)}</temp:Descripcion>
      <temp:Estado>${producto.estado}</temp:Estado>
      <temp:IdCategoria>${producto.idCategoria}</temp:IdCategoria>
      ${incluirId ? `<temp:IdProducto>${producto.idProducto}</temp:IdProducto>` : ''}
      <temp:Nombre>${this.escapar(producto.nombre)}</temp:Nombre>
      <temp:Precio>${producto.precio}</temp:Precio>
      <temp:Stock>${producto.stock}</temp:Stock>
    `;
  }

  private leerCategorias(xml: string): Categoria[] {
    return Array.from(this.documento(xml).getElementsByTagNameNS('*', 'Categoria'))
      .map((nodo) => ({
        idCategoria: Number(this.valorDe(nodo, 'IdCategoria')),
        nombre: this.valorDe(nodo, 'Nombre'),
        descripcion: this.valorDe(nodo, 'Descripcion'),
        estado: this.valorDe(nodo, 'Estado') === 'true',
      }));
  }

  private leerProductos(xml: string): Producto[] {
    return Array.from(this.documento(xml).getElementsByTagNameNS('*', 'Producto'))
      .map((nodo) => this.productoDesdeNodo(nodo));
  }

  private leerProducto(xml: string): Producto | null {
    const nodo = this.documento(xml).getElementsByTagNameNS('*', 'Producto')[0];
    return nodo ? this.productoDesdeNodo(nodo) : null;
  }

  private productoDesdeNodo(nodo: Element): Producto {
    return {
      idProducto: Number(this.valorDe(nodo, 'IdProducto')),
      nombre: this.valorDe(nodo, 'Nombre'),
      descripcion: this.valorDe(nodo, 'Descripcion'),
      precio: Number(this.valorDe(nodo, 'Precio')),
      stock: Number(this.valorDe(nodo, 'Stock')),
      estado: this.valorDe(nodo, 'Estado') === 'true',
      idCategoria: Number(this.valorDe(nodo, 'IdCategoria')),
    };
  }

  private documento(xml: string): Document {
    return new DOMParser().parseFromString(xml, 'text/xml');
  }

  private valorDe(nodo: Document | Element, nombre: string): string {
    return nodo.getElementsByTagNameNS('*', nombre)[0]?.textContent ?? '';
  }

  private escapar(valor: string): string {
    return (valor || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
