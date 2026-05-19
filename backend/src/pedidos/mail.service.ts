import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { Pedido } from './entities/pedido.entity';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Si se configuran variables SMTP en el .env, las usamos
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      console.log(`[Email] Servicio de correo inicializado en modo REAL (Servidor SMTP: ${host}:${port}, Usuario: ${user}).`);
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });
    } else {
      console.warn('[Email] ADVERTENCIA: No se configuraron las variables SMTP en el .env. Los correos se simularán localmente y se guardará una copia en backend/uploads/emails/.');
      // Fallback: Transporter mock para no romper el flujo local
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    }
  }

  async enviarCorreoConfirmacion(pedido: Pedido) {
    if (!pedido || !pedido.usuario) return;

    const emailUsuario = pedido.usuario.email;
    const nombreUsuario = pedido.usuario.nombre || 'Constructor';
    const idPedido = pedido.idPedido;
    const total = Number(pedido.total);
    const direccion = pedido.direccionEnvio || pedido.usuario.direccion || 'Retiro en sucursal';

    // Generar las filas de los productos en HTML
    const itemsHtml = pedido.lineas && pedido.lineas.length > 0
      ? pedido.lineas.map(linea => {
          const nombre = linea.producto ? linea.producto.titulo : (linea.combo ? linea.combo.titulo : 'Producto LEGO');
          const subtotal = Number(linea.precioHistorico) * Number(linea.cantidad);
          const imgUrl = linea.producto?.imagen || '/assets/vexa-logo.png'; // Fallback a logo
          return `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">
                <strong>${linea.cantidad}x</strong> ${nombre}
              </td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #64748b; text-align: right;">
                $${Number(linea.precioHistorico).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
              </td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b; font-weight: bold; text-align: right;">
                $${subtotal.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
              </td>
            </tr>
          `;
        }).join('')
      : `<tr><td colspan="3" style="padding: 12px; text-align: center; color: #64748b;">Detalles del pedido en proceso...</td></tr>`;

    // Hermoso HTML con estética LEGO Premium
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmación de Compra - Bloque Mundo</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="600px" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;" border="0" cellspacing="0" cellpadding="0">
                
                <!-- HEADER CON TEMÁTICA LEGO (Colores vibrantes) -->
                <tr>
                  <td style="background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); padding: 35px 40px; text-align: center; position: relative;">
                    <!-- Bloques decorativos en CSS -->
                    <div style="font-size: 28px; font-weight: 900; color: #ffffff; text-transform: uppercase; letter-spacing: -1px; font-style: italic;">
                      BLOQUE MUNDO
                    </div>
                    <div style="font-size: 11px; font-weight: bold; color: #fecdd3; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">
                      Tienda Oficial de Bloques
                    </div>
                  </td>
                </tr>

                <!-- CONTENIDO PRINCIPAL -->
                <tr>
                  <td style="padding: 40px 40px 30px 40px;">
                    <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; text-align: center;">
                      ¡Gracias por tu compra, ${nombreUsuario}!
                    </h1>
                    <p style="font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 25px 0; text-align: center;">
                      Nuestros maestros constructores ya están preparando tu caja de diversión. A continuación encontrarás el resumen detallado de tu orden de compra.
                    </p>

                    <!-- CAJA DE INFO DE ORDEN -->
                    <table width="100%" style="background-color: #f1f5f9; border-radius: 16px; padding: 15px 20px; margin-bottom: 30px;" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase;">Número de Orden:</td>
                        <td style="font-size: 14px; font-weight: 800; color: #0f172a; text-align: right;">#${idPedido}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase; padding-top: 8px;">Método de Envío:</td>
                        <td style="font-size: 13px; font-weight: 600; color: #334155; text-align: right; padding-top: 8px; max-width: 250px; word-break: break-word;">${direccion}</td>
                      </tr>
                    </table>

                    <!-- DETALLE DE PRODUCTOS -->
                    <h2 style="font-size: 14px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">
                      Productos Adquiridos
                    </h2>
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
                      <thead>
                        <tr>
                          <th align="left" style="padding: 8px 12px; font-size: 11px; font-weight: bold; color: #94a3b8; text-transform: uppercase; border-bottom: 2px solid #e2e8f0;">Producto</th>
                          <th align="right" style="padding: 8px 12px; font-size: 11px; font-weight: bold; color: #94a3b8; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; width: 80px;">Unitario</th>
                          <th align="right" style="padding: 8px 12px; font-size: 11px; font-weight: bold; color: #94a3b8; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; width: 90px;">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHtml}
                      </tbody>
                    </table>

                    <!-- TOTAL -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="font-size: 16px; font-weight: 800; color: #0f172a;">Total Abonado:</td>
                        <td style="font-size: 22px; font-weight: 900; color: #e11d48; text-align: right;">
                          $${total.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- RECOMENDACIÓN LEGO / PIE DE PÁGINA INTERNO -->
                <tr>
                  <td style="padding: 0 40px 40px 40px; text-align: center;">
                    <div style="background-color: #fffbeb; border: 1px dashed #fef08a; border-radius: 16px; padding: 15px 20px; margin-bottom: 35px;">
                      <p style="font-size: 13px; color: #854d0e; font-weight: 600; margin: 0;">
                        💡 ¿Sabías que puedes seguir el estado de envío en tiempo real ingresando a la sección "Mis Compras" en tu perfil?
                      </p>
                    </div>

                    <a href="http://localhost:5173/perfil/compras" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-weight: bold; font-size: 14px; text-decoration: none; padding: 14px 30px; rounded-border: 50px; border-radius: 50px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                      Ver mi pedido en la tienda
                    </a>
                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td style="background-color: #f1f5f9; padding: 25px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0; line-height: 1.5;">
                      Este es un correo automático enviado por Bloque Mundo. Por favor no respondas a esta dirección.
                    </p>
                    <p style="font-size: 11px; color: #94a3b8; margin: 0;">
                      &copy; 2026 Bloque Mundo. Todos los derechos reservados de sus constructores.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // 1. Intentar enviar correo real o mock
    try {
      await this.transporter.sendMail({
        from: '"Bloque Mundo 🧱" <noreply@bloquemundo.com>',
        to: emailUsuario,
        subject: `¡Gracias por tu compra, ${nombreUsuario}! (Pedido #${idPedido})`,
        html: htmlContent,
      });
      console.log(`[Email] Correo enviado a ${emailUsuario} para el pedido #${idPedido}`);
    } catch (e) {
      console.error('[Email] No se pudo enviar el correo real/mock:', e);
    }

    // 2. Guardar el correo localmente en HTML como demostración
    try {
      const emailDir = path.join(process.cwd(), 'uploads', 'emails');
      if (!fs.existsSync(emailDir)) {
        fs.mkdirSync(emailDir, { recursive: true });
      }
      const filePath = path.join(emailDir, `pedido_${idPedido}.html`);
      fs.writeFileSync(filePath, htmlContent, 'utf-8');
      console.log(`[Email] Copia local del correo guardada en: ${filePath}`);
    } catch (err) {
      console.error('[Email] No se pudo escribir la copia local del correo:', err);
    }
  }

  async enviarCorreoRegistro(usuario: any) {
    if (!usuario || !usuario.email) return;

    const emailUsuario = usuario.email;
    const nombreUsuario = usuario.nombre || 'Constructor';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>¡Te damos la bienvenida a Bloque Mundo!</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="600px" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;" border="0" cellspacing="0" cellpadding="0">
                
                <!-- HEADER CON TEMÁTICA LEGO -->
                <tr>
                  <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 35px 40px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 900; color: #ffffff; text-transform: uppercase; letter-spacing: -1px; font-style: italic;">
                      BLOQUE MUNDO
                    </div>
                    <div style="font-size: 11px; font-weight: bold; color: #fef3c7; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">
                      ¡Bienvenido al Club!
                    </div>
                  </td>
                </tr>

                <!-- CONTENIDO PRINCIPAL -->
                <tr>
                  <td style="padding: 40px 40px 30px 40px;">
                    <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; text-align: center;">
                      ¡Hola, ${nombreUsuario}! 🧱
                    </h1>
                    <p style="font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 25px 0; text-align: center;">
                      Tu cuenta ha sido creada con éxito. Desde ahora formas parte de la comunidad de constructores de bloques más increíble. ¡Prepárate para dar vida a tus mejores ideas!
                    </p>

                    <!-- CAJA DE REGALO / ENVÍO GRATIS -->
                    <div style="background-color: #eff6ff; border: 2px dashed #3b82f6; border-radius: 16px; padding: 25px; text-align: center; margin-bottom: 30px;">
                      <span style="font-size: 40px; display: block; margin-bottom: 10px;">🎁</span>
                      <h2 style="font-size: 18px; font-weight: 800; color: #1e3a8a; margin: 0 0 8px 0; text-transform: uppercase;">
                        ¡Tu primer envío es totalmente GRATIS!
                      </h2>
                      <p style="font-size: 14px; color: #2563eb; font-weight: 600; margin: 0;">
                        Queremos que tu primera experiencia sea increíble. El beneficio de envío gratis se aplicará de forma automática al realizar tu primera compra. ¡No dejes pasar esta oportunidad!
                      </p>
                    </div>

                    <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin: 0 0 25px 0; text-align: center;">
                      Explora nuestro catálogo de sets de LEGO, piezas sueltas, figuras y creaciones de colección.
                    </p>
                  </td>
                </tr>

                <!-- BOTÓN ACCIONABLE -->
                <tr>
                  <td style="padding: 0 40px 40px 40px; text-align: center;">
                    <a href="http://localhost:5173/tienda" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-weight: bold; font-size: 14px; text-decoration: none; padding: 14px 30px; border-radius: 50px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                      Explorar la Tienda
                    </a>
                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td style="background-color: #f1f5f9; padding: 25px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0; line-height: 1.5;">
                      Este es un correo automático enviado por Bloque Mundo. Por favor no respondas a esta dirección.
                    </p>
                    <p style="font-size: 11px; color: #94a3b8; margin: 0;">
                      &copy; 2026 Bloque Mundo. Todos los derechos reservados de sus constructores.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: '"Bloque Mundo 🧱" <noreply@bloquemundo.com>',
        to: emailUsuario,
        subject: `¡Te damos la bienvenida a Bloque Mundo, ${nombreUsuario}! ✨`,
        html: htmlContent,
      });
      console.log(`[Email] Correo de bienvenida enviado a ${emailUsuario}`);
    } catch (e) {
      console.error('[Email] No se pudo enviar el correo de bienvenida:', e);
    }

    // Copia local
    try {
      const emailDir = path.join(process.cwd(), 'uploads', 'emails');
      if (!fs.existsSync(emailDir)) {
        fs.mkdirSync(emailDir, { recursive: true });
      }
      const filePath = path.join(emailDir, `registro_${usuario.idUsuario || 'new'}.html`);
      fs.writeFileSync(filePath, htmlContent, 'utf-8');
      console.log(`[Email] Copia local del correo de bienvenida guardada en: ${filePath}`);
    } catch (err) {
      console.error('[Email] No se pudo escribir la copia local del correo de bienvenida:', err);
    }
  }

  async enviarCorreoEstadoEnvio(envio: any, estadoAnterior: string) {
    if (!envio || !envio.pedido || !envio.pedido.usuario) return;

    const pedido = envio.pedido;
    const emailUsuario = pedido.usuario.email;
    const nombreUsuario = pedido.usuario.nombre || 'Constructor';
    const idPedido = pedido.idPedido;
    const idEnvio = envio.idEnvio;
    const nuevoEstado = envio.estado;
    const direccion = envio.direccion || pedido.usuario.direccion || 'Dirección no registrada';

    // Formular mensajes y colores según el estado
    let colorHeader = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'; // Azul para En camino
    let subheader = 'Tu paquete está en viaje 🚚';
    let titleHtml = '¡Tu pedido está en camino!';
    let detailMessage = `Nos alegra contarte que tu pedido #${idPedido} ha sido despachado por nuestros constructores y está en camino a tu domicilio.`;
    
    if (nuevoEstado === 'Entregado') {
      colorHeader = 'linear-gradient(135deg, #10b981 0%, #047857 100%)'; // Verde para Entregado
      subheader = '¡Tu paquete ha llegado! 🎉';
      titleHtml = '¡Tu pedido fue entregado!';
      detailMessage = `¡Excelentes noticias! Tu pedido #${idPedido} ha sido entregado exitosamente en la dirección registrada. ¡Esperamos que disfrutes armando tus nuevos bloques!`;
    }

    const itemsHtml = pedido.lineas && pedido.lineas.length > 0
      ? pedido.lineas.map(linea => {
          const nombre = linea.producto ? linea.producto.titulo : (linea.combo ? linea.combo.titulo : 'Producto LEGO');
          return `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">
                <strong>${linea.cantidad}x</strong> ${nombre}
              </td>
            </tr>
          `;
        }).join('')
      : '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Novedades sobre tu envío - Bloque Mundo</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="600px" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;" border="0" cellspacing="0" cellpadding="0">
                
                <!-- HEADER TEMÁTICO CON COLOR CONDICIONAL -->
                <tr>
                  <td style="background: ${colorHeader}; padding: 35px 40px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 900; color: #ffffff; text-transform: uppercase; letter-spacing: -1px; font-style: italic;">
                      BLOQUE MUNDO
                    </div>
                    <div style="font-size: 11px; font-weight: bold; color: #ffffff; opacity: 0.85; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">
                      ${subheader}
                    </div>
                  </td>
                </tr>

                <!-- CONTENIDO PRINCIPAL -->
                <tr>
                  <td style="padding: 40px 40px 30px 40px;">
                    <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; text-align: center;">
                      ${titleHtml}
                    </h1>
                    <p style="font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 25px 0; text-align: center;">
                      Hola, ${nombreUsuario}. Tenemos novedades sobre el estado de entrega de tus bloques de construcción.
                    </p>

                    <!-- DETALLE PRINCIPAL -->
                    <div style="background-color: #f1f5f9; border-radius: 16px; padding: 20px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
                      <p style="font-size: 14px; color: #334155; line-height: 1.5; margin: 0 0 12px 0;">
                        ${detailMessage}
                      </p>
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px solid #cbd5e1; padding-top: 12px; margin-top: 12px;">
                        <tr>
                          <td style="font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase;">ID de Envío:</td>
                          <td style="font-size: 12px; font-weight: 700; color: #0f172a; text-align: right;">#${idEnvio}</td>
                        </tr>
                        <tr>
                          <td style="font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase; padding-top: 6px;">Dirección de entrega:</td>
                          <td style="font-size: 12px; font-weight: 600; color: #0f172a; text-align: right; padding-top: 6px; max-width: 200px; word-break: break-word;">${direccion}</td>
                        </tr>
                      </table>
                    </div>

                    ${itemsHtml ? `
                    <!-- PRODUCTOS EN EL PAQUETE -->
                    <h2 style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px;">
                      Productos en el Paquete
                    </h2>
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
                      <tbody>
                        ${itemsHtml}
                      </tbody>
                    </table>
                    ` : ''}

                    ${nuevoEstado === 'Entregado' ? `
                    <!-- LLAMADO A OPINAR -->
                    <div style="background-color: #eff6ff; border: 1px dashed #3b82f6; border-radius: 16px; padding: 15px 20px; text-align: center; margin-bottom: 30px;">
                      <p style="font-size: 13px; color: #1e3a8a; font-weight: 600; margin: 0;">
                        ⭐️ ¡Tu opinión cuenta! Ahora puedes ingresar a "Mis Compras" y dejar tu reseña sobre los productos recibidos para ayudar a otros constructores.
                      </p>
                    </div>
                    ` : ''}

                  </td>
                </tr>

                <!-- BOTÓN ACCIONABLE -->
                <tr>
                  <td style="padding: 0 40px 40px 40px; text-align: center;">
                    <a href="http://localhost:5173/perfil/compras" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-weight: bold; font-size: 14px; text-decoration: none; padding: 14px 30px; border-radius: 50px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                      Ver mis compras
                    </a>
                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td style="background-color: #f1f5f9; padding: 25px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0; line-height: 1.5;">
                      Este es un correo automático enviado por Bloque Mundo. Por favor no respondas a esta dirección.
                    </p>
                    <p style="font-size: 11px; color: #94a3b8; margin: 0;">
                      &copy; 2026 Bloque Mundo. Todos los derechos reservados de sus constructores.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: '"Bloque Mundo 🧱" <noreply@bloquemundo.com>',
        to: emailUsuario,
        subject: `Novedades sobre tu envío (Pedido #${idPedido}): ${nuevoEstado}`,
        html: htmlContent,
      });
      console.log(`[Email] Correo de actualización de envío (${nuevoEstado}) enviado a ${emailUsuario}`);
    } catch (e) {
      console.error('[Email] No se pudo enviar el correo de actualización de envío:', e);
    }

    // Copia local
    try {
      const emailDir = path.join(process.cwd(), 'uploads', 'emails');
      if (!fs.existsSync(emailDir)) {
        fs.mkdirSync(emailDir, { recursive: true });
      }
      const filePath = path.join(emailDir, `envio_${idPedido}_${nuevoEstado.replace(/\s+/g, '_')}.html`);
      fs.writeFileSync(filePath, htmlContent, 'utf-8');
      console.log(`[Email] Copia local del correo de envío guardada en: ${filePath}`);
    } catch (err) {
      console.error('[Email] No se pudo escribir la copia local del correo de envío:', err);
    }
  }
}
