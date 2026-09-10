import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ProductoExterno } from './models';

interface RespuestaProductosExternos {
  products: ProductoExterno[];
}

@Injectable({
  providedIn: 'root',
})
export class CatalogoExternoService {
  private readonly url = 'https://dummyjson.com/products/search';

  constructor(private readonly http: HttpClient) {}

  buscarProductos(texto: string): Observable<ProductoExterno[]> {
    return this.http
      .get<RespuestaProductosExternos>(`${this.url}?q=${encodeURIComponent(texto)}`)
      .pipe(map((respuesta) => respuesta.products ?? []));
  }
}
