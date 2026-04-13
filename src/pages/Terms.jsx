import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "./Legal.css";

export default function Terms() {
  return (
    <div className="legal-page container">
      <Link to="/" className="btn btn-sm btn-outline legal-back"><ArrowLeft size={14} /> Inicio</Link>

      <h1>Términos y Condiciones</h1>
      <p className="legal-updated">Última actualización: abril 2026</p>

      <section>
        <h2>1. Aceptación de los Términos</h2>
        <p>
          Al registrarse y utilizar la plataforma Xixaro ("la Plataforma"), usted acepta estos
          Términos y Condiciones en su totalidad. Si no está de acuerdo con alguna disposición,
          no utilice la Plataforma. Xixaro es una plataforma de comercio electrónico entre
          empresas (B2B) que facilita la conexión entre productores agrícolas y compradores
          comerciales en los Estados Unidos Mexicanos.
        </p>
      </section>

      <section>
        <h2>2. Definiciones</h2>
        <ul>
          <li><strong>Productor:</strong> Persona física o moral dedicada a la producción agrícola que ofrece productos a través de la Plataforma.</li>
          <li><strong>Comprador Comercial:</strong> Restaurante, supermercado, distribuidora, exportadora o empresa de alimentos que adquiere productos a través de la Plataforma.</li>
          <li><strong>Pedido:</strong> Solicitud formal de compra realizada por un Comprador Comercial a un Productor.</li>
          <li><strong>Producto:</strong> Bien agrícola ofrecido por un Productor en la Plataforma.</li>
        </ul>
      </section>

      <section>
        <h2>3. Registro y Cuentas</h2>
        <p>
          Para utilizar la Plataforma es necesario crear una cuenta proporcionando información
          veraz y actualizada. El usuario es responsable de mantener la confidencialidad de
          sus credenciales de acceso. Xixaro se reserva el derecho de suspender o eliminar
          cuentas que proporcionen información falsa o que incumplan estos Términos.
        </p>
        <p>
          Al registrarse como Productor, usted declara que cuenta con la capacidad legal
          para comercializar productos agrícolas conforme a las leyes mexicanas aplicables.
          Al registrarse como Comprador Comercial, usted declara que actúa en representación
          de una empresa o negocio legalmente constituido.
        </p>
      </section>

      <section>
        <h2>4. Publicación de Productos</h2>
        <p>
          Los Productores son responsables de la veracidad de la información publicada,
          incluyendo descripción, precio, cantidad disponible, calidad y origen del producto.
          Todos los productos están sujetos a un proceso de moderación antes de aparecer
          en el marketplace. Xixaro se reserva el derecho de rechazar productos que no
          cumplan con los estándares de la Plataforma.
        </p>
        <p>
          Los precios publicados son en Pesos Mexicanos (MXN) y se expresan por tonelada
          salvo que se indique otra unidad. El Productor es responsable de cumplir con las
          normas sanitarias y de calidad aplicables según la NOM correspondiente.
        </p>
      </section>

      <section>
        <h2>5. Pedidos y Transacciones</h2>
        <p>
          La Plataforma facilita la conexión entre Productores y Compradores Comerciales.
          Los pedidos realizados a través de Xixaro constituyen un acuerdo comercial entre
          las partes involucradas. Xixaro no es parte de la transacción comercial y no
          garantiza el cumplimiento de entregas, calidad del producto ni condiciones de pago
          entre las partes.
        </p>
        <p>
          El Comprador Comercial se compromete a especificar cantidades, fechas de entrega
          y condiciones de manera clara. El Productor se compromete a confirmar o rechazar
          pedidos en un plazo razonable y a cumplir con las condiciones acordadas.
        </p>
      </section>

      <section>
        <h2>6. Reseñas y Calificaciones</h2>
        <p>
          Los usuarios pueden dejar reseñas y calificaciones de sus contrapartes comerciales.
          Las reseñas deben ser honestas, respetuosas y basadas en experiencias reales.
          Una vez publicadas, las reseñas no pueden ser editadas ni eliminadas. Xixaro se
          reserva el derecho de moderar contenido que sea ofensivo, falso o que viole
          estos Términos.
        </p>
      </section>

      <section>
        <h2>7. Responsabilidades y Limitaciones</h2>
        <p>
          Xixaro actúa exclusivamente como intermediario tecnológico y no asume
          responsabilidad por: la calidad de los productos, el cumplimiento de entregas,
          disputas comerciales entre usuarios, pérdidas derivadas del uso de la Plataforma,
          ni daños causados por información incorrecta publicada por los usuarios.
        </p>
        <p>
          Los usuarios se obligan a resolver sus controversias de manera directa. En caso
          de no llegar a un acuerdo, podrán recurrir a los mecanismos de resolución de
          controversias previstos en la legislación mexicana aplicable.
        </p>
      </section>

      <section>
        <h2>8. Propiedad Intelectual</h2>
        <p>
          Todo el contenido de la Plataforma, incluyendo diseño, código, marcas, logotipos
          e iconos, es propiedad de Xixaro o de sus licenciantes y está protegido por las
          leyes de propiedad intelectual aplicables en México. Queda prohibida su
          reproducción sin autorización expresa.
        </p>
      </section>

      <section>
        <h2>9. Suspensión y Terminación</h2>
        <p>
          Xixaro puede suspender o cancelar cuentas de usuarios que incumplan estos
          Términos, publiquen información falsa, realicen prácticas comerciales desleales
          o pongan en riesgo la integridad de la Plataforma. El usuario puede solicitar
          la eliminación de su cuenta en cualquier momento.
        </p>
      </section>

      <section>
        <h2>10. Legislación Aplicable</h2>
        <p>
          Estos Términos se rigen por las leyes de los Estados Unidos Mexicanos,
          incluyendo el Código de Comercio, la Ley Federal de Protección al Consumidor
          (en lo aplicable), la Ley Federal de Protección de Datos Personales en Posesión
          de los Particulares y demás legislación aplicable. Para cualquier controversia,
          las partes se someten a la jurisdicción de los tribunales competentes de la
          Ciudad de México.
        </p>
      </section>

      <section>
        <h2>11. Modificaciones</h2>
        <p>
          Xixaro se reserva el derecho de modificar estos Términos en cualquier momento.
          Las modificaciones serán notificadas a los usuarios a través de la Plataforma
          y entrarán en vigor a partir de su publicación. El uso continuado de la
          Plataforma después de las modificaciones constituye la aceptación de los nuevos
          Términos.
        </p>
      </section>

      <section>
        <h2>12. Contacto</h2>
        <p>
          Para cualquier consulta relacionada con estos Términos, puede contactarnos
          a través del chat de la Plataforma o enviando un correo a la dirección de
          contacto disponible en la sección de soporte.
        </p>
      </section>
    </div>
  );
}
