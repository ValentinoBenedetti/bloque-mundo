import { Entity, PrimaryColumn, Column, ManyToMany, JoinTable, BeforeInsert, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Producto } from '../../productos/entities/producto.entity';

@Entity('combos')
export class Combo {
    @PrimaryColumn({ type: 'int' })
    idCombo: number;

    @Column({ type: 'varchar', length: 100, nullable: true })
    codigoCombo: string;

    @Column({ type: 'varchar', length: 100 })
    titulo: string;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precio: number;

    @Column({ type: 'int', default: 0 })
    stock: number;

    @Column({ type: 'date', nullable: true })
    fechaInicio: string;

    @Column({ type: 'date', nullable: true })
    fechaFin: string;

    @Column({ type: 'varchar', length: 20, default: 'Publicado' })
    estado: string;

    @Column({ type: 'boolean', default: false })
    esDestacado: boolean;

    @Column({ type: 'boolean', default: false })
    esNovedad: boolean;

    @Column({ type: 'varchar', length: 255, nullable: true })
    imagen: string;

    @Column({ type: 'text', array: true, nullable: true })
    imagenes: string[];

    @CreateDateColumn()
    fechaCreacion: Date;

    @UpdateDateColumn()
    fechaEdicion: Date;

    @ManyToMany(() => Producto)
    @JoinTable({
        name: 'pertenece',
        joinColumn: {
            name: 'idCombo',
            referencedColumnName: 'idCombo'
        },
        inverseJoinColumn: {
            name: 'idProducto',
            referencedColumnName: 'idProducto'
        }
    })
    productos: Producto[];

    @BeforeInsert()
    generarIdAleatorio() {
        this.idCombo = Math.floor(10000 + Math.random() * 90000);
    }
}
