document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("whatsappForm");
  
    form.addEventListener("submit", function (e) {
      e.preventDefault();
  
      let nombre = document.getElementById("nombre").value;
      let mensaje = document.getElementById("mensaje").value;
  
      let texto = `Hola, soy ${nombre}. ${mensaje}`;
      let numero = "50686195690"; // cambia por tu número
  
      let url = `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
  
      window.open(url, "_blank");
    });
  });