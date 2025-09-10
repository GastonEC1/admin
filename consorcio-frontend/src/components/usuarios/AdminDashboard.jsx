import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EditUserForm from './EditUserForm.jsx';
import { FaTrash, FaEdit } from 'react-icons/fa';

// The base URL for the backend API
const BACKEND_BASE_URL = 'https://refactored-xylophone-jv659gpjqq62jqr5-5000.app.github.dev';

// Main component: AdminDashboard
const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [message, setMessage] = useState('');

  // Function to show a temporary message
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 5000);
  };

  // Fetches users from the API
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('authToken');

    if (!token) {
      setError('No se encontró el token de autenticación. Por favor, inicia sesión.');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(
        `${BACKEND_BASE_URL}/api/admin/users`,
        {
          headers: { 'Authorization': `Bearer ${token}` }, // Corrected header
        }
      );
      setUsers(res.data);
    } catch (err) {
      console.error('Error al cargar los usuarios:', err.response);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setError('Acceso no autorizado. Por favor, inicia sesión de nuevo.');
      } else {
        setError('Ocurrió un error al cargar los usuarios. Revisa tu conexión y el estado del servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Effect hook to fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Handler for opening the delete confirmation modal
  const handleDelete = (id) => {
    setUserToDelete(id);
    setShowConfirmModal(true);
  };

  // Handler for confirming the deletion
  const confirmDelete = async () => {
    setShowConfirmModal(false);
    if (!userToDelete) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No se encontró el token de autenticación.');
        return;
      }
      await axios.delete(
        `${BACKEND_BASE_URL}/api/admin/users/${userToDelete}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setUsers(users.filter((user) => user._id !== userToDelete));
      showMessage('Usuario eliminado con éxito.');
    } catch (err) {
      console.error('Error al eliminar el usuario:', err.response);
      showMessage('Error al eliminar el usuario. Revisa la consola para más detalles.');
    } finally {
      setUserToDelete(null);
    }
  };

  // Handler for updating a user
  const handleUserUpdated = () => {
    setEditingUser(null);
    fetchUsers();
    showMessage('Usuario actualizado con éxito.');
  };

  // Handler to cancel editing
  const handleCancel = () => {
    setEditingUser(null);
  };

  return (
    <div className="container mt-5">
     
      <style>
        {`@import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');`}
      </style>
      <div className="card shadow">
        <div className="card-header bg-primary text-white text-center">
          <h1 className="h4 mb-0">Panel de Administración de Usuarios</h1>
        </div>
        <div className="card-body">
          {message && (
            <div className="alert alert-success" role="alert">
              {message}
            </div>
          )}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {editingUser ? (
            <EditUserForm 
              user={editingUser} 
              onUserUpdated={handleUserUpdated}
              onCancel={handleCancel}
              showMessage={showMessage}
            />
          ) : (
            <div className="table-responsive">
              {loading ? (
                <div className="text-center my-4 text-muted">
                  Cargando usuarios...
                </div>
              ) : (
                <table className="table table-striped table-hover align-middle">
                  <thead>
                    <tr>
                      <th scope="col">Nombre</th>
                      <th scope="col">Email</th>
                      <th scope="col">Rol</th>
                      <th scope="col">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? (
                      users.map(user => (
                        <tr key={user._id}>
                          <td>{user.nombre}</td>
                          <td>{user.email}</td>
                          <td>{user.rol}</td>
                          <td>
                            <button 
                              onClick={() => setEditingUser(user)}
                              className="btn btn-sm btn-outline-info me-2"
                            >
                              <FaEdit/>Editar
                            </button>
                            <button 
                              onClick={() => handleDelete(user._id)}
                              className="btn btn-sm btn-outline-danger"
                            >
                              <FaTrash/>Eliminar
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center text-muted">No hay usuarios para mostrar.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Custom Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar Eliminación</h5>
                <button type="button" className="btn-close" onClick={() => setShowConfirmModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;