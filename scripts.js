// 👇 Muestra el campo correcto según si el usuario elige postre del menú o personalizado
function cambiarTipoPostre() {
    const tipo = document.getElementById("tipoPostre").value;
    const menu = document.getElementById("postreMenu");
    const personalizado = document.getElementById("postrePersonalizado");
  
    // Oculta ambos campos primero
    menu.style.display = "none";
    personalizado.style.display = "none";
  
    // Muestra solo el campo seleccionado
    if (tipo === "menu") {
      menu.style.display = "block";
      menu.required = true;
      personalizado.required = false;
    } else if (tipo === "personalizado") {
      personalizado.style.display = "block";
      personalizado.required = true;
      menu.required = false;
    }
  
    // Limpia la vista previa si cambia la selección
    document.getElementById("previewProducto").innerHTML = "";
  }
  
  // 🧁 Enviar pedido por WhatsApp y guardar datos en Google Sheets
  function enviarPorWhatsapp() {
    // Obtener los campos del formulario
    const nombre = document.getElementById("nombre");
    const correo = document.getElementById("correo");
    const tipoPostre = document.getElementById("tipoPostre").value;
    const postreMenu = document.getElementById("postreMenu");
    const postrePersonalizado = document.getElementById("postrePersonalizado");
    const detalle = document.getElementById("detalle");
    const fecha = document.getElementById("fecha");
    const hora = document.getElementById("hora");
    const estado = document.getElementById("estadoPedido");
  
    // Eliminar errores previos
    [nombre, correo, postreMenu, postrePersonalizado, fecha, hora].forEach(el => el.classList.remove("error"));
    estado.textContent = "";
  
    let valido = true;
  
    // Validar campos obligatorios
    if (!nombre.value.trim()) { nombre.classList.add("error"); valido = false; }
    if (!correo.value.trim()) { correo.classList.add("error"); valido = false; }
  
    let postre = "";
    if (tipoPostre === "menu") {
      postre = postreMenu.value.trim();
      if (!postre) { postreMenu.classList.add("error"); valido = false; }
    } else if (tipoPostre === "personalizado") {
      postre = postrePersonalizado.value.trim();
      if (!postre) { postrePersonalizado.classList.add("error"); valido = false; }
    } else {
      estado.textContent = "Seleccioná una opción para el tipo de postre.";
      estado.style.color = "#e74c3c";
      return;
    }
  
    if (!fecha.value) { fecha.classList.add("error"); valido = false; }
    if (!hora.value) { hora.classList.add("error"); valido = false; }
  
    if (!valido) {
      estado.textContent = "Por favor completá todos los campos obligatorios.";
      estado.style.color = "#e74c3c";
      return;
    }
  
    // Armar mensaje para WhatsApp
    const mensaje = `Hola AliPasteleri! 😄%0AQuiero hacer un pedido:%0A%0A👤 Nombre: ${nombre.value}%0A✉️ Correo: ${correo.value}%0A🍰 Postre: ${postre}%0A📅 Fecha de entrega: ${fecha.value}%0A⏰ Hora límite de entrega: ${hora.value}%0A📝 Detalles: ${detalle.value || 'Sin detalles extra'}`;
  
    // URL del Google Apps Script
    const scriptURL = "https://script.google.com/macros/s/AKfycbzd-_V0Ipje39I3Hf_zDiFfo67ynkg-XZhUBWe95dQZJRaRSAKsSx1gLO9UX3LfeBGwXA/exec";

    // Datos a enviar a Google Sheets
    const datos = {
      nombre: nombre.value,
      correo: correo.value,
      postre,
      fecha: fecha.value,
      hora: hora.value,
      detalle: detalle.value || "Sin detalles extra"
    };
  
    // Guardar en Sheets
    fetch(scriptURL, {
        method: "POST",
        mode: "no-cors", // 👈 Esto evita el error CORS
        body: JSON.stringify(datos),
        headers: { "Content-Type": "application/json" }
      })
      
      .then(() => console.log("✅ Pedido guardado en Google Sheets"))
      .catch(err => console.error("❌ Error al guardar en Sheets", err));
  
    // Aviso visual
    estado.textContent = "Redirigiéndote a WhatsApp... 🍰";
    estado.style.color = "#2ecc71";
  
    // Redirigir a WhatsApp
    const numero = "59898923768";
    const url = `https://wa.me/${numero}?text=${mensaje}`;
    window.open(url, "_blank");
  
    // Mostrar popup de éxito
    document.getElementById("popupConfirmacion").style.display = "flex";
  }
  
  // 🔒 Cierra el popup de confirmación
  function cerrarPopup() {
    document.getElementById("popupConfirmacion").style.display = "none";
  }
  
  // 👀 Mostrar imagen del postre seleccionado
  function vistaPreviaPostre() {
    const postreMenu = document.getElementById("postreMenu");
    const preview = document.getElementById("previewProducto");
    const inputFecha = document.getElementById("fecha");
  
    // Evitar seleccionar fecha pasada
    const hoy = new Date().toISOString().split("T")[0];
    inputFecha.setAttribute("min", hoy);
  
    // Muestra la imagen del postre seleccionado
    if (postreMenu) {
      postreMenu.addEventListener("change", () => {
        const postre = postreMenu.value;
        let img = "";
        if (postre === "Torta Chajá") img = "Imagenes/PostreChaja.png";
        else if (postre === "Rogel") img = "Imagenes/rogel.jpg";
        else if (postre === "Mousse de Chocolate") img = "Imagenes/mousse-choco.png";
        else if (postre === "Tarta Frutal") img = "Imagenes/tarta-frutas.png";
  
        // Mostrar imagen o limpiar
        preview.innerHTML = img ? `<img src="${img}" alt="${postre}" style="max-width: 250px; margin-top: 1rem; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: opacity 0.5s;" onload="this.style.opacity='1'" />` : "";
      });
    }
  }
  
  // 👤 Validación de clave para acceder al modo administrador
  function verificarClaveAdmin() {
    const clave = document.getElementById("claveAdmin").value;
    if (clave === "pasteleria2025") {
      document.getElementById("loginAdmin").style.display = "none";
      document.getElementById("admin").style.display = "block";
      document.getElementById("btnCerrarAdmin").style.display = "inline-block";
      cargarPedidos();
    } else {
      alert("Clave incorrecta ❌");
    }
  }
  
  // 🔚 Cerrar el panel admin
  function cerrarAdmin() {
    document.getElementById("admin").style.display = "none";
    const mensaje = document.getElementById("mensajeCierreAdmin");
    mensaje.classList.add("mostrar");
    setTimeout(() => {
      mensaje.classList.remove("mostrar");
      mensaje.style.display = "none";
    }, 2500);
    mensaje.style.display = "block";
  }
  
  // 📥 Cargar pedidos en la tabla + gráfico
function cargarPedidos() {
    fetch("https://script.google.com/macros/s/AKfycbzd-_V0Ipje39I3Hf_zDiFfo67ynkg-XZhUBWe95dQZJRaRSAKsSx1gLO9UX3LfeBGwXA/exec")
      .then(res => res.json())
      .then(data => {
        const tabla = document.querySelector("#tablaPedidos tbody");
        const postres = {};
        tabla.innerHTML = "";
  
        data.forEach(p => {
          tabla.innerHTML += `
            <tr>
              <td>${p.Nombre}</td>
              <td>${p.Postre}</td>
              <td>${p.Fecha}</td>
              <td>${p["Hora límite"]}</td>
              <td>${p.Detalles}</td>
              <td>${p["Fecha de envío"]}</td>
              <td><span class="estado">Pendiente</span></td>
              <td>
                <button class="btnEntregado" onclick="marcarEntregado(this)">✅ Entregado</button>
                <button class="btnCancelar" onclick="cancelarPedido(this)">❌ Cancelar</button>
              </td>
            </tr>`;
          postres[p.Postre] = (postres[p.Postre] || 0) + 1;
        });
  
        // Mostrar gráfico de pedidos por tipo
        const ctx = document.getElementById("graficoPedidos").getContext("2d");
        new Chart(ctx, {
          type: "bar",
          data: {
            labels: Object.keys(postres),
            datasets: [{
              label: "Cantidad de pedidos por postre",
              data: Object.values(postres),
              backgroundColor: "#b88f63"
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
          }
        });
      })
      .catch(err => console.error("❌ Error al cargar pedidos", err));
  }
  
  
  
  // ✅ Marcar pedido como entregado
  function marcarEntregado(btn) {
    const fila = btn.closest("tr");
    fila.querySelector(".estado").textContent = "Entregado ✅";
    btn.disabled = true;
    btn.nextElementSibling.disabled = true;
    btn.style.opacity = 0.5;
    btn.nextElementSibling.style.opacity = 0.5;
  }
  
  // ❌ Cancelar pedido
  function cancelarPedido(btn) {
    const fila = btn.closest("tr");
    fila.querySelector(".estado").textContent = "Cancelado ❌";
    btn.disabled = true;
    btn.previousElementSibling.disabled = true;
    btn.style.opacity = 0.5;
    btn.previousElementSibling.style.opacity = 0.5;
  }
  
  // 🔍 Buscador + exportador
  document.addEventListener("DOMContentLoaded", () => {
    vistaPreviaPostre();
  
    const buscador = document.getElementById("buscadorPedidos");
    if (buscador) {
      buscador.addEventListener("input", function () {
        const filtro = this.value.toLowerCase();
        const filas = document.querySelectorAll("#tablaPedidos tbody tr");
        filas.forEach(fila => {
          const texto = fila.textContent.toLowerCase();
          fila.style.display = texto.includes(filtro) ? "" : "none";
        });
      });
    }
  
    // Exportar pedidos a CSV
    const exportarBtn = document.getElementById("exportarCSV");
    if (exportarBtn) {
      exportarBtn.addEventListener("click", () => {
        const filas = document.querySelectorAll("#tablaPedidos tr");
        let csv = "";
        filas.forEach(f => {
          const cols = f.querySelectorAll("td, th");
          csv += [...cols].map(td => `"${td.innerText}"`).join(",") + "\n";
        });
        const blob = new Blob([csv], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "pedidos.csv";
        link.click();
      });
    }
  });
  
  // 🔓 Mostrar el login del modo administrador
  function mostrarLoginAdmin() {
    document.getElementById("loginAdmin").style.display = "flex";
  }
  
