export class CreateCuponDto {
    codigo: string;
    porcentaje: number;
    fechaInicio: string;
    fechaFin: string;
    condicion?: string;
    topeUso?: number;
    montoMinimo?: number;
    idTemaRequerido?: number;
}
