import React, { useEffect, useState } from "react";
import axios from "axios";

// The base URL for the backend API
const BACKEND_BASE_URL = 'https://refactored-xylophone-jv659gpjqq62jqr5-5000.app.github.dev';

const EditUserForm = ({ user, onUserUpdated, onCancel, showMessage }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    rol: '',
    password: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        email: user.email || '',
        rol: user.rol || '',
        password: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        nombre: formData.nombre,
        email: formData.email,
        rol: formData.rol
      };
      if (formData.password) {
        dataToSend.password = formData.password;
      }

      const token = localStorage.getItem('authToken');
      if (!token) {
        showMessage('Error: No se encontró el token de autenticación.');
        return;
      }

      await axios.put(
        `${BACKEND_BASE_URL}/api/admin/users/${user._id}`,
        dataToSend,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      showMessage('Usuario actualizado con éxito.');
      onUserUpdated();
    } catch (err) {
      console.error(err);
      showMessage('Error al actualizar el usuario. Revisa la consola para más detalles.');
    }
  };

  return (
    <div className="card p-4 shadow-sm">
      <h2 className="card-title text-center mb-4">Editar Usuario</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="nombre" className="form-label">Nombre:</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Nueva Contraseña:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-control"
            placeholder="Dejar en blanco para no cambiar"
          />
        </div>
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUserForm;