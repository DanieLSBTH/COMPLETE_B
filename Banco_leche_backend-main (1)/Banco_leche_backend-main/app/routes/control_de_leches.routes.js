module.exports =app=>{
const controlDeLechesController = require('../controllers/control_de_leches.controller');
const router = require("express").Router();
// Crear un nuevo registro de control_de_leches
router.post('/', controlDeLechesController.create);

// Recuperar todos los registros de control_de_leches
router.get('/', controlDeLechesController.findAll);
router.get("/stock-estadisticas", controlDeLechesController.getStockByDateRange);
router.get('/metrics',controlDeLechesController.getMetrics)
router.get('/control-de-leche/totales', controlDeLechesController.findTotalsAndRecordsByDateRange);
// Recuperar un registro de control_de_leches por su ID
router.get('/search/frasco', controlDeLechesController.findByFrasco);
// 🆕 Nueva ruta detallada


// Actualizar un registro de control_de_leches por su ID
router.get('/:id_control_leche', controlDeLechesController.findOne);

router.put('/:id_control_leche', controlDeLechesController.update);

// Eliminar un registro de control_de_leches por su ID
router.delete('/:id_control_leche', controlDeLechesController.delete);

// Eliminar todos los registros de control_de_leches


app.use("/api/control_de_leches", router);
};
