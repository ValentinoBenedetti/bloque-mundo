import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Pedido } from '../../pedidos/entities/pedido.entity';
import { Producto } from '../../productos/entities/producto.entity';

@Entity('lineas_pedido')
export class LineaPedido {
    @PrimaryGeneratedColumn()
    idLineaPedido: number;

    @Column({ type: 'int' })
    cantidad: number;

    // Guardamos el precio en el momento de la compra (por si el LEGO sube de precio mañana)
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precioHistorico: number;

    @ManyToOne(() => Pedido, (pedido) => pedido.lineas)
    @JoinColumn({ name: 'idPedido' })
    pedido: Pedido;

    @ManyToOne(() => Producto)
    @JoinColumn({ name: 'idProducto' })
    producto: Producto;
}