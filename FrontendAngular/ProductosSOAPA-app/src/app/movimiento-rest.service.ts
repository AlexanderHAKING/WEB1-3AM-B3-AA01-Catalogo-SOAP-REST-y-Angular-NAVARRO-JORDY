import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MovimientoFormulario, MovimientoInventario } from './models';

@Injectable({
  providedIn: 'root',
})
export class MovimientoRestService {
  private readonly url = 'http://localhost:5232/api/movimientos';

  constructor(private readonly http: HttpClient) {}

  obtenerMovimientos(): Observable<MovimientoInventario[]> {
    return this.http.get<MovimientoInventario[]>(this.url);
  }

  agregarMovimiento(movimiento: MovimientoFormulario): Observable<MovimientoInventario> {
    return this.http.post<MovimientoInventario>(this.url, movimiento);
  }

  actualizarMovimiento(id: number, movimiento: MovimientoFormulario): Observable<MovimientoInventario> {
    return this.http.put<MovimientoInventario>(`${this.url}/${id}`, movimiento);
  }

  eliminarMovimiento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
