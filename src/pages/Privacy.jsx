import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "./Legal.css";

export default function Privacy() {
  return (
    <div className="legal-page container">
      <Link to="/" className="btn btn-sm btn-outline legal-back"><ArrowLeft size={14} /> Inicio</Link>

      <h1>Política de Privacidad</h1>
      <p className="legal-updated">Última actualización: abril 2026</p>

      <section>
        <h2>1. Responsable del Tratamiento</h2>
        <p>
          Xixaro ("nosotros", "la Plataforma") es responsable del tratamiento de los datos
          personales que usted proporciona al utilizar nuestros servicios, de conformidad con
          la Ley Federal de Protección de Datos Personales en Posesión de los Particulares
          (LFPDPPP) y su Reglamento.
        </p>
      </section>

      <section>
        <h2>2. Datos Personales que Recopilamos</h2>
        <p>Recopilamos los siguientes datos personales:</p>
        <ul>
          <li><strong>Datos de identificación:</strong> Nombre o razón social, correo electrónico.</li>
          <li><strong>Datos de contacto:</strong> Dirección de correo electrónico utilizada para el registro.</li>
          <li><strong>Datos comerciales:</strong> Rol en la Plataforma (productor o comprador), productos publicados, pedidos realizados, reseñas y calificaciones.</li>
          <li><strong>Datos de geolocalización:</strong> Ubicación aproximada proporcionada voluntariamente al publicar productos.</li>
          <li><strong>Datos de uso:</strong> Interacciones con la Plataforma, mensajes enviados a través del chat interno.</li>
        </ul>
      </section>

      <section>
        <h2>3. Finalidades del Tratamiento</h2>
        <p>Sus datos personales son utilizados para:</p>
        <ul>
          <li>Crear y administrar su cuenta en la Plataforma.</li>
          <li>Facilitar la conexión comercial entre productores agrícolas y compradores.</li>
          <li>Procesar y dar seguimiento a pedidos.</li>
          <li>Permitir la comunicación entre usuarios a través del chat interno.</li>
          <li>Enviar notificaciones relacionadas con su actividad (nuevos pedidos, cambios de estado, productos de interés).</li>
          <li>Moderar contenido publicado en la Plataforma.</li>
          <li>Generar estadísticas internas de uso (de forma anonimizada).</li>
          <li>Cumplir con obligaciones legales aplicables.</li>
        </ul>
      </section>

      <section>
        <h2>4. Fundamento Legal</h2>
        <p>
          El tratamiento de sus datos se realiza con base en el consentimiento que usted
          otorga al registrarse en la Plataforma y aceptar estos términos, así como en el
          cumplimiento de la relación comercial establecida, de conformidad con los
          artículos 8 y 12 de la LFPDPPP.
        </p>
      </section>

      <section>
        <h2>5. Transferencia de Datos</h2>
        <p>
          Sus datos personales pueden ser compartidos con:
        </p>
        <ul>
          <li><strong>Otros usuarios de la Plataforma:</strong> Su nombre o razón social, productos, reseñas y ubicación aproximada son visibles para otros usuarios registrados como parte del funcionamiento de la Plataforma.</li>
          <li><strong>Proveedores de servicios tecnológicos:</strong> Utilizamos Firebase (Google LLC) para almacenamiento, autenticación y base de datos. Google cumple con estándares internacionales de protección de datos.</li>
          <li><strong>Autoridades competentes:</strong> Cuando sea requerido por ley o resolución judicial.</li>
        </ul>
        <p>
          No vendemos, alquilamos ni compartimos sus datos personales con terceros para
          fines publicitarios o de marketing sin su consentimiento expreso.
        </p>
      </section>

      <section>
        <h2>6. Derechos ARCO</h2>
        <p>
          Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento
          de sus datos personales (derechos ARCO), así como a revocar su consentimiento,
          de conformidad con la LFPDPPP. Para ejercer estos derechos, envíe una solicitud
          a través del chat de la Plataforma o por correo electrónico indicando:
        </p>
        <ul>
          <li>Nombre completo y correo electrónico registrado.</li>
          <li>Descripción clara del derecho que desea ejercer.</li>
          <li>Cualquier documento que acredite su identidad.</li>
        </ul>
        <p>
          Daremos respuesta a su solicitud en un plazo máximo de 20 días hábiles conforme
          a la ley.
        </p>
      </section>

      <section>
        <h2>7. Medidas de Seguridad</h2>
        <p>
          Implementamos medidas de seguridad técnicas, administrativas y físicas para
          proteger sus datos personales contra acceso no autorizado, pérdida, alteración
          o destrucción. Entre estas medidas se incluyen:
        </p>
        <ul>
          <li>Autenticación segura mediante Firebase Authentication.</li>
          <li>Reglas de seguridad en base de datos que restringen el acceso por usuario y rol.</li>
          <li>Cifrado de datos en tránsito mediante HTTPS.</li>
          <li>Variables de entorno para proteger credenciales de configuración.</li>
        </ul>
      </section>

      <section>
        <h2>8. Uso de Cookies y Tecnologías</h2>
        <p>
          La Plataforma utiliza almacenamiento local del navegador (localStorage) para
          mantener la sesión del usuario. No utilizamos cookies de terceros ni tecnologías
          de rastreo publicitario. Firebase puede utilizar cookies técnicas necesarias para
          el funcionamiento del servicio de autenticación.
        </p>
      </section>

      <section>
        <h2>9. Conservación de Datos</h2>
        <p>
          Sus datos personales se conservarán mientras mantenga una cuenta activa en la
          Plataforma. Al solicitar la eliminación de su cuenta, sus datos serán eliminados
          en un plazo razonable, salvo aquellos que debamos conservar por obligación legal
          o para la resolución de controversias pendientes.
        </p>
      </section>

      <section>
        <h2>10. Menores de Edad</h2>
        <p>
          La Plataforma está dirigida exclusivamente a personas mayores de 18 años y a
          empresas legalmente constituidas. No recopilamos intencionalmente datos de
          menores de edad.
        </p>
      </section>

      <section>
        <h2>11. Modificaciones</h2>
        <p>
          Nos reservamos el derecho de actualizar esta Política de Privacidad. Cualquier
          cambio será publicado en la Plataforma y, en caso de modificaciones sustanciales,
          se notificará a los usuarios. Le recomendamos revisar periódicamente esta página.
        </p>
      </section>

      <section>
        <h2>12. Contacto</h2>
        <p>
          Para cualquier consulta sobre el tratamiento de sus datos personales, puede
          contactarnos a través del chat de la Plataforma o enviando un correo a la
          dirección de contacto disponible en la sección de soporte.
        </p>
      </section>
    </div>
  );
}
