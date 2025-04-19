// 👇 Muestra el campo correcto según si el usuario elige postre del menú o personalizado
function cambiarTipoPostre() {
    const tipo = document.getElementById("tipoPostre").value;
    const menu = document.getElementById("postreMenu");
    const personalizado = document.getElementById("postrePersonalizado");
  
    menu.style.display = "none";
    personalizado.style.display = "none";
  
    if (tipo === "menu") {
      menu.style.display = "block";
      menu.required = true;
      personalizado.required = false;
    } else if (tipo === "personalizado") {
      personalizado.style.display = "block";
      personalizado.required = true;
      menu.required = false;
    }
  
    document.getElementById("previewProducto").innerHTML = "";
  }
  
  // 🧁 Enviar pedido por WhatsApp y guardar datos en Google Sheets
  function enviarPorWhatsapp() {
    const nombre = document.getElementById("nombre");
    const correo = document.getElementById("correo");
    const tipoPostre = document.getElementById("tipoPostre").value;
    const postreMenu = document.getElementById("postreMenu");
    const postrePersonalizado = document.getElementById("postrePersonalizado");
    const detalle = document.getElementById("detalle");
    const fecha = document.getElementById("fecha");
    const hora = document.getElementById("hora");
    const estado = document.getElementById("estadoPedido");
  
    [nombre, correo, postreMenu, postrePersonalizado, fecha, hora].forEach(el => el.classList.remove("error"));
    estado.textContent = "";
  
    let valido = true;
  
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
  
    const mensaje = `Hola AliPasteleri! 😄%0AQuiero hacer un pedido:%0A%0A👤 Nombre: ${nombre.value}%0A✉️ Correo: ${correo.value}%0A🍰 Postre: ${postre}%0A📅 Fecha de entrega: ${fecha.value}%0A⏰ Hora límite de entrega: ${hora.value}%0A📝 Detalles: ${detalle.value || 'Sin detalles extra'}`;
  
    const scriptURL = "https://script.google.com/macros/s/AKfycbzd-_V0Ipje39I3Hf_zDiFfo67ynkg-XZhUBWe95dQZJRaRSAKsSx1gLO9UX3LfeBGwXA/exec";
  
    const datos = {
      nombre: nombre.value,
      correo: correo.value,
      postre,
      fecha: fecha.value,
      hora: hora.value,
      detalle: detalle.value || "Sin detalles extra"
    };
  
    fetch(scriptURL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(datos),
      headers: { "Content-Type": "application/json" }
    })
    .then(() => console.log("✅ Pedido guardado en Google Sheets"))
    .catch(err => console.error("❌ Error al guardar en Sheets", err));
  
    estado.textContent = "Redirigiéndote a WhatsApp... 🍰";
    estado.style.color = "#2ecc71";
  
    const numero = "59898923768";
    const url = `https://wa.me/${numero}?text=${mensaje}`;
    window.open(url, "_blank");
  
    document.getElementById("popupConfirmacion").style.display = "flex";
  }
  
  function cerrarPopup() {
    document.getElementById("popupConfirmacion").style.display = "none";
  }
  
  function vistaPreviaPostre() {
    const postreMenu = document.getElementById("postreMenu");
    const preview = document.getElementById("previewProducto");
    const inputFecha = document.getElementById("fecha");
  
    const hoy = new Date().toISOString().split("T")[0];
    inputFecha.setAttribute("min", hoy);
  
    if (postreMenu) {
      postreMenu.addEventListener("change", () => {
        const postre = postreMenu.value;
        let img = "";
        if (postre === "Torta Chajá") img = "Imagenes/PostreChaja.png";
        else if (postre === "Rogel") img = "Imagenes/rogel.jpg";
        else if (postre === "Mousse de Chocolate") img = "Imagenes/mousse-choco.png";
        else if (postre === "Tarta Frutal") img = "Imagenes/tarta-frutas.png";
  
        preview.innerHTML = img ? `<img src="${img}" alt="${postre}" style="max-width: 250px; margin-top: 1rem; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: opacity 0.5s;" onload="this.style.opacity='1'" />` : "";
      });
    }
  }
  
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
  
  function cargarPedidos() {
    fetch("https://script.google.com/macros/s/AKfycbzd-_V0Ipje39I3Hf_zDiFfo67ynkg-XZhUBWe95dQZJRaRSAKsSx1gLO9UX3LfeBGwXA/exec")
      .then(response => response.text())
      .then(text => JSON.parse(text))
      .then(data => {
        const tabla = document.querySelector("#tablaPedidos tbody");
        const postres = {};
        tabla.innerHTML = "";
  
        data.forEach(p => {
          tabla.innerHTML += `
            <tr>
              <td>${p.Nombre}</td>
              <td>${p.Correo}</td>
              <td>${p.Postre}</td>
              <td>${p.Fecha}</td>
              <td>${p["Hora límite"] || p.Hora}</td>
              <td>${p.Detalles || p.Detalle}</td>
              <td>${p["Fecha de envío"]}</td>
              <td><span class="estado">Pendiente</span></td>
              <td>
                <button class="btnEntregado" onclick="marcarEntregado(this)">✅ Entregado</button>
                <button class="btnCancelar" onclick="cancelarPedido(this)">❌ Cancelar</button>
              </td>
            </tr>`;
          postres[p.Postre] = (postres[p.Postre] || 0) + 1;
        });
  
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
  
  function marcarEntregado(btn) {
    const fila = btn.closest("tr");
    fila.querySelector(".estado").textContent = "Entregado ✅";
    btn.disabled = true;
    btn.nextElementSibling.disabled = true;
    btn.style.opacity = 0.5;
    btn.nextElementSibling.style.opacity = 0.5;
  }
  
  function cancelarPedido(btn) {
    const fila = btn.closest("tr");
    fila.querySelector(".estado").textContent = "Cancelado ❌";
    btn.disabled = true;
    btn.previousElementSibling.disabled = true;
    btn.style.opacity = 0.5;
    btn.previousElementSibling.style.opacity = 0.5;
  }
  
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
  
  function mostrarLoginAdmin() {
    document.getElementById("loginAdmin").style.display = "flex";
  }
  
  function doOptions(e) {
    return ContentService.createTextOutput('')
      .setMimeType(ContentService.MimeType.TEXT)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }// ✅ Muestra el campo correcto según la selección
function cambiarTipoPostre() {
    const tipo = document.getElementById("tipoPostre").value;
    const menu = document.getElementById("postreMenu");
    const personalizado = document.getElementById("postrePersonalizado");
  
    menu.style.display = "none";
    personalizado.style.display = "none";
  
    if (tipo === "menu") {
      menu.style.display = "block";
      menu.required = true;
      personalizado.required = false;
    } else if (tipo === "personalizado") {
      personalizado.style.display = "block";
      personalizado.required = true;
      menu.required = false;
    }
  
    document.getElementById("previewProducto").innerHTML = "";
  }
  
  // 🧁 Enviar pedido por WhatsApp y guardar en Sheets
  function enviarPorWhatsapp() {
    const nombre = document.getElementById("nombre");
    const correo = document.getElementById("correo");
    const tipoPostre = document.getElementById("tipoPostre").value;
    const postreMenu = document.getElementById("postreMenu");
    const postrePersonalizado = document.getElementById("postrePersonalizado");
    const detalle = document.getElementById("detalle");
    const fecha = document.getElementById("fecha");
    const hora = document.getElementById("hora");
    const estado = document.getElementById("estadoPedido");
  
    [nombre, correo, postreMenu, postrePersonalizado, fecha, hora].forEach(el => el.classList.remove("error"));
    estado.textContent = "";
  
    let valido = true;
  
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
  
    const mensaje = `Hola AliPasteleri! 😄%0AQuiero hacer un pedido:%0A%0A👤 Nombre: ${nombre.value}%0A✉️ Correo: ${correo.value}%0A🍰 Postre: ${postre}%0A📅 Fecha de entrega: ${fecha.value}%0A⏰ Hora límite de entrega: ${hora.value}%0A📝 Detalles: ${detalle.value || 'Sin detalles extra'}`;
  
    const scriptURL = "https://script.google.com/macros/s/AKfycbzd-_V0Ipje39I3Hf_zDiFfo67ynkg-XZhUBWe95dQZJRaRSAKsSx1gLO9UX3LfeBGwXA/exec";
  
    const datos = {
      nombre: nombre.value,
      correo: correo.value,
      postre,
      fecha: fecha.value,
      hora: hora.value,
      detalle: detalle.value || "Sin detalles extra"
    };
  
    fetch(scriptURL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(datos),
      headers: { "Content-Type": "application/json" }
    })
      .then(() => console.log("✅ Pedido guardado en Google Sheets"))
      .catch(err => console.error("❌ Error al guardar en Sheets", err));
  
    estado.textContent = "Redirigiéndote a WhatsApp... 🍰";
    estado.style.color = "#2ecc71";
  
    const numero = "59898923768";
    const url = `https://wa.me/${numero}?text=${mensaje}`;
    window.open(url, "_blank");
  
    document.getElementById("popupConfirmacion").style.display = "flex";
  }
  
  // 🔒 Cerrar popup
  function cerrarPopup() {
    document.getElementById("popupConfirmacion").style.display = "none";
  }
  
  // 👀 Mostrar imagen del postre
  function vistaPreviaPostre() {
    const postreMenu = document.getElementById("postreMenu");
    const preview = document.getElementById("previewProducto");
    const inputFecha = document.getElementById("fecha");
    const hoy = new Date().toISOString().split("T")[0];
    inputFecha.setAttribute("min", hoy);
  
    if (postreMenu) {
      postreMenu.addEventListener("change", () => {
        const postre = postreMenu.value;
        let img = "";
        if (postre === "Torta Chajá") img = "Imagenes/PostreChaja.png";
        else if (postre === "Rogel") img = "Imagenes/rogel.jpg";
        else if (postre === "Mousse de Chocolate") img = "Imagenes/mousse-choco.png";
        else if (postre === "Tarta Frutal") img = "Imagenes/tarta-frutas.png";
  
        preview.innerHTML = img ? `<img src="${img}" alt="${postre}" style="max-width: 250px; margin-top: 1rem; border-radius: 10px;" />` : "";
      });
    }
  }
  
  // 🔑 Modo admin
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
  
  // 🔚 Cerrar panel admin
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
  
  // 📥 Cargar pedidos del Sheets
  function cargarPedidos() {
    fetch("https://script.google.com/macros/s/AKfycbzd-_V0Ipje39I3Hf_zDiFfo67ynkg-XZhUBWe95dQZJRaRSAKsSx1gLO9UX3LfeBGwXA/exec")
      .then(res => {
        console.log("🔄 Respuesta cruda del fetch:", res);
        return res.json();
      })
      .then(data => {
        console.log("✅ Datos recibidos:", data);
  
        const tabla = document.querySelector("#tablaPedidos tbody");
        const postres = {};
        tabla.innerHTML = "";
  
        data.forEach(p => {
          tabla.innerHTML += `
            <tr>
              <td>${p.Nombre}</td>
              <td>${p.Postre}</td>
              <td>${p.Fecha}</td>
              <td>${p["Hora límite"] || p.Hora}</td>
              <td>${p.Detalles || p.Detalle}</td>
              <td>${p["Fecha de envío"] || "-"}</td>
              <td><span class="estado">Pendiente</span></td>
              <td>
                <button class="btnEntregado" onclick="marcarEntregado(this)">✅ Entregado</button>
                <button class="btnCancelar" onclick="cancelarPedido(this)">❌ Cancelar</button>
              </td>
            </tr>`;
          postres[p.Postre] = (postres[p.Postre] || 0) + 1;
        });
  
        // Gráfico
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
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
          }
        });
      })
      .catch(err => {
        console.error("❌ Error al cargar pedidos", err);
        alert("No se pudieron cargar los pedidos. Verificá la conexión o los permisos del script.");
      });
  }
  
  
  // ✅ Acciones de botones en la tabla
  function marcarEntregado(btn) {
    const fila = btn.closest("tr");
    fila.querySelector(".estado").textContent = "Entregado ✅";
    btn.disabled = true;
    btn.nextElementSibling.disabled = true;
    btn.style.opacity = 0.5;
    btn.nextElementSibling.style.opacity = 0.5;
  }
  
  function cancelarPedido(btn) {
    const fila = btn.closest("tr");
    fila.querySelector(".estado").textContent = "Cancelado ❌";
    btn.disabled = true;
    btn.previousElementSibling.disabled = true;
    btn.style.opacity = 0.5;
    btn.previousElementSibling.style.opacity = 0.5;
  }
  
  // 🔍 Filtro y exportación CSV
  document.addEventListener("DOMContentLoaded", () => {
    vistaPreviaPostre();
  
    const buscador = document.getElementById("buscadorPedidos");
    if (buscador) {
      buscador.addEventListener("input", function () {
        const filtro = this.value.toLowerCase();
        document.querySelectorAll("#tablaPedidos tbody tr").forEach(fila => {
          const texto = fila.textContent.toLowerCase();
          fila.style.display = texto.includes(filtro) ? "" : "none";
        });
      });
    }
  
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
  
  // 🔐 Mostrar login admin
  function mostrarLoginAdmin() {
    document.getElementById("loginAdmin").style.display = "flex";
  }
  
