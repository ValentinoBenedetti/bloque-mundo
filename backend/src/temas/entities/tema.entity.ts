import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Producto } from '../../productos/entities/producto.entity';

@Entity('temas')
export class Tema {
    @PrimaryGeneratedColumn()
    idTema: number;

    @Column({ type: 'varchar', length: 50 })
    nombre: string;

    // Un Tema puede tener muchos Productos
    @OneToMany(() => Producto, (producto) => producto.tema)
    productos: Producto[];
}