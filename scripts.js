// ========================
// 📦 CONFIGURACIÓN GENERAL
// ========================
const scriptURL = "https://script.google.com/macros/s/AKfycbzd-_V0Ipje39I3Hf_zDiFfo67ynkg-XZhUBWe95dQZJRaRSAKsSx1gLO9UX3LfeBGwXA/exec";
const numeroWhatsApp = "59898923768";

// ========================
// 📥 FUNCIONES FORMULARIO
// ========================

function cambiarTipoPostre() {
  const tipo = document.getElementById("tipoPostre").value;
  const menu = document.getElementById("postreMenu");
  const personalizado = document.getElementById("postrePersonalizado");
  menu.style.display = personalizado.style.display = "none";
  menu.required = personalizado.required = false;

  if (tipo === "menu") {
    menu.style.display = "block";
    menu.required = true;
  } else if (tipo === "personalizado") {
    personalizado.style.display = "block";
    personalizado.required = true;
  }

  document.getElementById("previewProducto").innerHTML = "";
}

function enviarPorWhatsapp() {
  const nombre = document.getElementById("nombre").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const tipo = document.getElementById("tipoPostre").value;
  const postre = tipo === "menu" ? document.getElementById("postreMenu").value.trim() : document.getElementById("postrePersonalizado").value.trim();
  const detalle = document.getElementById("detalle").value.trim() || "Sin detalles extra";
  const fecha = document.getElementById("fecha").value;
  const hora = document.getElementById("hora").value;

  if (!nombre || !correo || !postre || !fecha || !hora) {
    alert("Por favor completá todos los campos obligatorios");
    return;
  }

  const pedido = { nombre, correo, postre, fecha, hora, detalle, estado: "Pendiente" };
  guardarPedidoEnFirebase(pedido);

  fetch(scriptURL, {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify(pedido),
    headers: { "Content-Type": "application/json" }
  });

  const mensaje = `Hola AliPasteleri! 😄%0AQuiero hacer un pedido:%0A%0A👤 Nombre: ${nombre}%0A✉️ Correo: ${correo}%0A🍰 Postre: ${postre}%0A📅 Fecha: ${fecha}%0A⏰ Hora: ${hora}%0A📝 Detalles: ${detalle}`;
  window.open(`https://wa.me/${numeroWhatsApp}?text=${mensaje}`, "_blank");

  document.getElementById("popupConfirmacion").style.display = "flex";
}

function cerrarPopup() {
  document.getElementById("popupConfirmacion").style.display = "none";
}

function vistaPreviaPostre() {
  const select = document.getElementById("postreMenu");
  const preview = document.getElementById("previewProducto");
  const imagenes = {
    "Torta Chajá": "Imagenes/PostreChaja.png",
    "Rogel": "Imagenes/rogel.jpg",
    "Mousse de Chocolate": "Imagenes/mousse-choco.png",
    "Tarta Frutal": "Imagenes/tarta-frutas.png"
  };

  select.addEventListener("change", () => {
    const src = imagenes[select.value] || "";
    preview.innerHTML = src ? `<img src="${src}" style="max-width:250px; border-radius:10px; margin-top:1rem">` : "";
  });

  document.getElementById("fecha").setAttribute("min", new Date().toISOString().split("T")[0]);
}

// ========================
// 🛠️ FIREBASE FUNCIONES
// ========================

function guardarPedidoEnFirebase(pedido) {
  db.collection("pedidos").add(pedido)
    .then(doc => console.log("✅ Pedido guardado con ID:", doc.id))
    .catch(err => console.error("❌ Error al guardar pedido:", err));
}

function actualizarEstadoPedidoPorId(id, nuevoEstado) {
  db.collection("pedidos").doc(id).update({ estado: nuevoEstado })
    .then(() => console.log("✅ Estado actualizado correctamente"))
    .catch(err => console.error("❌ Error al actualizar estado:", err));
}

function cargarPedidosDesdeFirestore() {
  db.collection("pedidos").get()
    .then(snapshot => {
      const tabla = document.querySelector("#tablaPedidos tbody");
      const postres = {};
      tabla.innerHTML = "";

      snapshot.forEach(doc => {
        const p = doc.data();
        const estado = p.estado || "Pendiente";
        const disabled = estado.includes("✅") || estado.includes("❌");

        tabla.innerHTML += `
          <tr data-id="${doc.id}">
            <td>${p.nombre}</td>
            <td>${p.postre}</td>
            <td>${p.fecha}</td>
            <td>${p.hora}</td>
            <td>${p.detalle}</td>
            <td>-</td>
            <td><span class="estado">${estado}</span></td>
            <td>
              <button class="btnEntregado" onclick="marcarEntregado(this)" ${disabled ? "disabled style='opacity:0.5'" : ""}>✅ Entregado</button>
              <button class="btnCancelar" onclick="cancelarPedido(this)" ${disabled ? "disabled style='opacity:0.5'" : ""}>❌ Cancelar</button>
            </td>
          </tr>`;

        postres[p.postre] = (postres[p.postre] || 0) + 1;
      });

      const ctx = document.getElementById("graficoPedidos").getContext("2d");
      const chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: Object.keys(postres),
          datasets: [{
            label: "Pedidos por postre",
            data: Object.values(postres),
            backgroundColor: "#d9a16c",
            borderRadius: 10,
            barThickness: 60
          }]
        },
        options: {
          responsive: true,
          animation: {
            duration: 1000,
            easing: "easeOutQuart"
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#fff",
              titleColor: "#000",
              bodyColor: "#333",
              borderColor: "#b88f63",
              borderWidth: 1
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1 },
              grid: { color: "#eee" }
            },
            x: { grid: { display: false } }
          }
        }
      });

      // Botón de descarga
      if (!document.getElementById("descargarGrafico")) {
        const btn = document.createElement("button");
        btn.id = "descargarGrafico";
        btn.textContent = "📥 Descargar gráfico";
        btn.className = "btnDescargaGrafico";
        document.getElementById("graficoPedidos").parentElement.prepend(btn);
      }

      document.getElementById("descargarGrafico").addEventListener("click", () => {
        const canvas = document.getElementById("graficoPedidos");
        const link = document.createElement("a");
        link.download = "grafico-pedidos.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    })
    .catch(err => {
      console.error("❌ Error al cargar pedidos", err);
      alert("No se pudieron cargar los pedidos desde Firebase");
    });
}

// ========================
// 🧾 ADMIN FUNCIONES
// ========================

function verificarClaveAdmin() {
  const clave = document.getElementById("claveAdmin").value;
  if (clave === "pasteleria2025") {
    document.getElementById("loginAdmin").style.display = "none";
    document.getElementById("admin").style.display = "block";
    document.getElementById("btnCerrarAdmin").style.display = "inline-block";
    cargarPedidosDesdeFirestore();
  } else {
    alert("Clave incorrecta ❌");
  }
}

function cerrarAdmin() {
  document.getElementById("admin").style.display = "none";
  const mensaje = document.getElementById("mensajeCierreAdmin");
  mensaje.classList.add("mostrar");
  setTimeout(() => mensaje.style.display = "none", 2500);
  mensaje.style.display = "block";
}

function marcarEntregado(btn) {
  const fila = btn.closest("tr");
  const id = fila.dataset.id;
  fila.querySelector(".estado").textContent = "Entregado ✅";
  btn.disabled = true;
  btn.nextElementSibling.disabled = true;
  btn.style.opacity = btn.nextElementSibling.style.opacity = 0.5;
  actualizarEstadoPedidoPorId(id, "Entregado ✅");
}

function cancelarPedido(btn) {
  const fila = btn.closest("tr");
  const id = fila.dataset.id;
  fila.querySelector(".estado").textContent = "Cancelado ❌";
  btn.disabled = true;
  btn.previousElementSibling.disabled = true;
  btn.style.opacity = btn.previousElementSibling.style.opacity = 0.5;
  actualizarEstadoPedidoPorId(id, "Cancelado ❌");
}



// ========================
// 🗑️ FUNCIONES DE BORRADO ADMIN
// ========================

// Borrar todos los pedidos
function borrarTodosLosPedidos() {
    if (!confirm("¿Estás seguro de que querés borrar TODOS los pedidos?")) return;
  
    db.collection("pedidos").get().then(snapshot => {
      const batch = db.batch();
      snapshot.forEach(doc => batch.delete(doc.ref));
      return batch.commit();
    }).then(() => {
      alert("✅ Todos los pedidos fueron eliminados.");
      cargarPedidosDesdeFirestore();
    }).catch(err => console.error("❌ Error al borrar pedidos:", err));
  }
  
  // Borrar solo los pedidos del mes actual
  function borrarPedidosDelMesActual() {
    const hoy = new Date();
    const mesActual = String(hoy.getMonth() + 1).padStart(2, "0"); // "04"
    const anioActual = hoy.getFullYear(); // 2025
  
    if (!confirm(`¿Querés borrar los pedidos de ${mesActual}/${anioActual}?`)) return;
  
    db.collection("pedidos").get().then(snapshot => {
      const batch = db.batch();
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.fecha) {
          const [a, m] = data.fecha.split("-");
          if (parseInt(a) === anioActual && m === mesActual) {
            batch.delete(doc.ref);
          }
        }
      });
      return batch.commit();
    }).then(() => {
      alert(`✅ Pedidos de ${mesActual}/${anioActual} eliminados.`);
      cargarPedidosDesdeFirestore();
    }).catch(err => console.error("❌ Error al borrar pedidos del mes:", err));
  }
  




// ========================
// 📊 REPORTE MENSUAL
// ========================
function generarReporteMensual() {
    const mesSeleccionado = document.getElementById("mesReporte").value;
    if (!mesSeleccionado) return alert("Elegí un mes para ver el reporte");
  
    const [anio, mes] = mesSeleccionado.split("-");
    const resumen = {
      total: 0,
      entregado: 0,
      cancelado: 0,
      pendiente: 0,
      postres: {}
    };
  
    db.collection("pedidos").get().then(snapshot => {
      snapshot.forEach(doc => {
        const data = doc.data();
        if (!data.fecha) return;
        const [a, m] = data.fecha.split("-");
        if (a === anio && m === mes) {
          resumen.total++;
          const estado = data.estado || "Pendiente";
          if (estado.includes("Entregado")) resumen.entregado++;
          else if (estado.includes("Cancelado")) resumen.cancelado++;
          else resumen.pendiente++;
  
          resumen.postres[data.postre] = (resumen.postres[data.postre] || 0) + 1;
        }
      });
  
      mostrarReporteEnPantalla(resumen, mes, anio);
    });
  }
  
  function mostrarReporteEnPantalla(data, mes, anio) {
    let contenedor = document.getElementById("contenedorReporte");
    if (!contenedor) {
      contenedor = document.createElement("div");
      contenedor.id = "contenedorReporte";
      contenedor.style.marginTop = "2rem";
      contenedor.innerHTML = `<h3>📋 Reporte mensual</h3><div id="resumenDatos"></div><canvas id="graficoReporte"></canvas>`;
      document.getElementById("admin").appendChild(contenedor);
    }
  
    const resumenHTML = `
      <p><strong>Mes:</strong> ${mes}/${anio}</p>
      <p><strong>Total pedidos:</strong> ${data.total}</p>
      <p>✅ Entregados: ${data.entregado}</p>
      <p>❌ Cancelados: ${data.cancelado}</p>
      <p>⏳ Pendientes: ${data.pendiente}</p>
    `;
    document.getElementById("resumenDatos").innerHTML = resumenHTML;
  
    // Gráfico de postres
    const ctx = document.getElementById("graficoReporte").getContext("2d");
    if (window.reporteChart) window.reporteChart.destroy();
    window.reporteChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(data.postres),
        datasets: [{
          label: "Pedidos por postre",
          data: Object.values(data.postres),
          backgroundColor: "#d9a16c",
          borderRadius: 10,
          barThickness: 60
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } },
          x: { grid: { display: false } }
        }
      }
    });
  }


  function exportarReporteCSV(pedidos) {
    let csv = "Nombre,Correo,Postre,Fecha,Hora,Detalle,Estado\n";
    pedidos.forEach(p => {
      csv += `"${p.nombre}","${p.correo}","${p.postre}","${p.fecha}","${p.hora}","${p.detalle}","${p.estado}"\n`;
    });
  
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "reporte-mensual.csv";
    link.click();
  }
  



// ========================
// 📤 UTILIDADES
// ========================

document.addEventListener("DOMContentLoaded", () => {
  vistaPreviaPostre();

  document.getElementById("buscadorPedidos")?.addEventListener("input", function () {
    const filtro = this.value.toLowerCase();
    document.querySelectorAll("#tablaPedidos tbody tr").forEach(fila => {
      fila.style.display = fila.textContent.toLowerCase().includes(filtro) ? "" : "none";
    });
  });

  document.getElementById("exportarCSV")?.addEventListener("click", () => {
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
});

function mostrarLoginAdmin() {
  document.getElementById("loginAdmin").style.display = "flex";
}
