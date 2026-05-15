export class CreateComboDto {
    titulo: string;
    precio: number;
    stock: number;
    fechaInicio?: string;
    fechaFin?: string;
    productosIds: number[];
    imagen?: string;
    imagenes?: string[];
    codigoCombo?: string;
}
