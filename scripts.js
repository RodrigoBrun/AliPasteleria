function enviarPorWhatsapp() {
    const nombre = document.querySelector('input[placeholder="Tu nombre"]').value;
    const correo = document.querySelector('input[placeholder="Correo electrónico"]').value;
    const postre = document.querySelector('input[placeholder="¿Qué postre te gustaría?"]').value;
    const detalle = document.querySelector('textarea').value;
  
    if (!nombre || !correo || !postre) {
      alert("Por favor completá todos los campos obligatorios.");
      return;
    }
  
    const mensaje = `Hola AliPasteleri! 👋%0AQuiero hacer un pedido:%0A%0A👤 Nombre: ${nombre}%0A Correo: ${correo}%0A Postre: ${postre}%0A Detalles: ${detalle || 'Sin detalles extra'}`;
  
    const numero = "59898923768";
    const url = `https://wa.me/${numero}?text=${mensaje}`;
    window.open(url, "_blank");
  }
  
