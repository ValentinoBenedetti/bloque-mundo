import { Entity, PrimaryColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Pedido } from '../../pedidos/entities/pedido.entity';
import { Tema } from '../../temas/entities/tema.entity';

@Entity('cupones')
export class Cupon {
    @PrimaryColumn({ type: 'varchar', length: 20 })
    codigo: string;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    porcentaje: number;

    @Column({ type: 'date' })
    fechaInicio: string;

    @Column({ type: 'date' })
    fechaFin: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    condicion: string;

    @Column({ type: 'int', default: 0 })
    topeUso: number;

    // --- NUEVOS CAMPOS ESTRUCTURADOS DE CONDICIÓN ---
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    montoMinimo: number;

    @ManyToOne(() => Tema, { nullable: true })
    @JoinColumn({ name: 'idTemaRequerido' })
    temaRequerido: Tema;

    @Column({ type: 'boolean', default: true })
    valido: boolean;

    @OneToMany(() => Pedido, (pedido) => pedido.cupon)
    pedidos: Pedido[];
}
