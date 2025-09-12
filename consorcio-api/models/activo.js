const mongoose = require("mongoose");

const historialMantenimientoSchema = new mongoose.Schema({
  fecha: {
    type: Date,
    required: true,
  },
  descripcion: {
    type: String,
    required: true,
  },
});

const activoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  tipo: {
    type: String,
    enum: [
      "Sistema Eléctrico",
      "Ascensor",
      "Plomería",
      "HVAC",
      "Seguridad",
      "Mobiliario",
      "Recreativo",
      "Otro",
    ],
    required: true,
  },
  marca: {
    type: String,
  },
  modelo: {
    type: String,
  },
  ubicacion: {
    type: String,
    required: true,
  },
  descripcion: {
    type: String,
  },
  fechaInstalacion: {
    type: Date,
  },
  proximoMantenimiento: {
    type: Date,
  },
  frecuenciaMantenimiento: {
    type: String,
    enum: [
      "Mensual",
      "Trimestral",
      "Semestral",
      "Anual",
      "Según Uso",
      "No aplica",
    ],
    default: "No aplica",
  },
  estado: {
    type: String,
    enum: [
      "Operativo",
      "En Reparacion",
      "Fuera de Servicio",
      "Pendiente de Mantenimiento",
    ],
    default: "Operativo",
  },
  fechaUltimoMantenimiento: {
    type: Date,
  },
  consorcio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Consorcio",
    required: true,
  },
  historialMantenimiento: [historialMantenimientoSchema],
});

module.exports =
  mongoose.models.Activo || mongoose.model("Activo", activoSchema);