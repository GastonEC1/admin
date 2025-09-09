const mongoose = require("mongoose");

const activoSchema = new mongoose.Schema({
  nombre: {
    type: String,
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
  ultimoCostoMantenimiento: {
    type: Number,
    default: 0,
  },
  fechaUltimoMantenimiento: {
    type: Date,
  },
  consorcio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Consorcio",
    required: true,
  },
});

module.exports =
  mongoose.models.Activo || mongoose.model("Activo", activoSchema);
