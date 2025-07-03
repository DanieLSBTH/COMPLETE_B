module.exports = (app) => {
  const donadoraDetalle = require("../controllers/donadora_detalle.controller.js");
  const router = require("express").Router();

  // Crear un nuevo registro en donadora_detalle
  router.post("/", donadoraDetalle.create);

  // Recuperar todos los registros de donadora_detalle
  router.get("/", donadoraDetalle.findAll);
  // Nueva ruta GET para obtener el resumen de donaciones por servicio con parámetros de fechas
  router.get("/resumen-por-servicio", donadoraDetalle.getDonacionesPorServicio);
  // Ruta para la nueva consulta
  router.get('/resumen-donaciones', donadoraDetalle.getResumenDonaciones);
  router.get('/resumen-por-mes', donadoraDetalle.getResumenPorMes);
  router.get('/buscar/id_donadora', donadoraDetalle.findDetailsByName);
  router.get('/stats', donadoraDetalle.getStats);
  router.get('/top-donadoras', donadoraDetalle.getTopDonadoras);
  
  // Recuperar un registro de donadora_detalle por su ID
  router.get("/:id_donadora_detalle", donadoraDetalle.findOne);
  
  // Actualizar un registro de donadora_detalle por su ID
  router.put("/:id_donadora_detalle", donadoraDetalle.update);

  // Eliminar un registro de donadora_detalle por su ID
  router.delete("/:id_donadora_detalle", donadoraDetalle.delete);

  // Eliminar todos los registros de donadora_detalle
  router.delete("/", donadoraDetalle.deleteAll);
    
  app.use("/api/donadora_detalle", router);
};
