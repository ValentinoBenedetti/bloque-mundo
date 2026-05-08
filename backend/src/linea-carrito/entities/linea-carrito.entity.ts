import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Carrito } from '../../carrito/entities/carrito.entity';
import { Producto } from '../../productos/entities/producto.entity';
import { Combo } from '../../combos/entities/combo.entity';

@Entity('lineas_carrito')
export class LineaCarrito {
    @PrimaryGeneratedColumn()
    idLineaCarrito: number;

    @Column({ type: 'int' })
    cantidad: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precioUnitario: number;

    // Relación N:1 -> Muchas líneas pertenecen a un solo carrito
    @ManyToOne(() => Carrito, (carrito) => carrito.lineas)
    @JoinColumn({ name: 'idCarrito' })
    carrito: Carrito;

    // Relación N:1 -> Una línea apunta a un solo producto (LEGO)
    @ManyToOne(() => Producto, { nullable: true })
    @JoinColumn({ name: 'idProducto' })
    producto: Producto;

    // Relación N:1 -> Una línea puede apuntar a un combo
    @ManyToOne(() => Combo, { nullable: true })
    @JoinColumn({ name: 'idCombo' })
    combo: Combo;
}