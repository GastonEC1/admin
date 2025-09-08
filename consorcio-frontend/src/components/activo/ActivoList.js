import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaArrowLeft, FaPlus, FaSearch } from 'react-icons/fa';

const ActivoList = () => {
  // El URL de la API se define directamente en el componente
  const API_BASE_URL = 'https://refactored-xylophone-jv659gpjqq62jqr5-5000.app.github.dev/api';
  
  const [activos, setActivos] = useState([]);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda

  const [searchParams] = useSearchParams();
  const consorcioId = searchParams.get('consorcioId');

  useEffect(() => {
    if (!consorcioId) {
      setCargando(false);
      return;
    }
    
    const obtenerActivos = async () => {
      const activosBackendUrl = `${API_BASE_URL}/activos?consorcioId=${consorcioId}`;

      try {
        const res = await fetch(activosBackendUrl);
        if (!res.ok) throw new Error('Error al obtener los activos');
        const data = await res.json();
        setActivos(data);
        setError(null);
      } catch (err) {
        console.error('Error en la petición GET:', err);
        setError('No se pudo cargar la lista. Revisa la conexión con el servidor.');
      } finally {
        setCargando(false);
      }
    };
    obtenerActivos();
  }, [consorcioId]);

  const eliminarActivo = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este activo?')) {
      try {
        const res = await fetch(`${API_BASE_URL}/activos/${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Error al eliminar el activo');
        setActivos(activos.filter(activo => activo._id !== id));
        setError(null);
      } catch (err) {
        console.error('Error en la petición DELETE:', err);
        setError('No se pudo eliminar el activo.');
      }
    }
  };

  const filteredActivos = activos.filter(activo => {
    if (!searchTerm) {
      return true;
    }

    const searchWords = searchTerm.toLowerCase().split(' ').filter(word => word.length > 0);
    const activoNombre = activo.nombre.toLowerCase();
    
    return searchWords.every(searchWord => {
      return activoNombre.split(' ').some(activoWord => activoWord.startsWith(searchWord));
    });
  });

  if (cargando) return <div className="text-center mt-5">Cargando lista...</div>;
  if (error) return <div className="alert alert-danger text-center mt-5">{error}</div>;

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{consorcioId ? 'Activos del Consorcio' : 'Selecciona un Consorcio'}</h1>
        
        {consorcioId ? (
          <div className="d-flex">
            <Link 
              to={`/add-activo/${consorcioId}`} 
              className="btn btn-primary me-2"
            >
              <FaPlus className="me-2" /> Agregar Activo
            </Link>
            <Link to={`/consorcios/${consorcioId}`} className="btn btn-secondary">
              <FaArrowLeft className="me-2" /> Volver al Consorcio
            </Link>
          </div>
        ) : (
          <Link to="/" className="btn btn-secondary">
            <FaArrowLeft className="me-2" /> Volver a Consorcios
          </Link>
        )}
      </div>
      
      <div className="input-group mb-3">
        <span className="input-group-text"><FaSearch /></span>
        <input 
          type="text"
          className="form-control"
          placeholder="Buscar activo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={!consorcioId} 
        />
      </div>

      {consorcioId ? (
        <ul className="list-group">
          {filteredActivos.length > 0 ? (
            filteredActivos.map(activo => (
              <li key={activo._id} className="list-group-item d-flex justify-content-between align-items-center">
                <Link to={`/activos/${activo._id}`} className="text-decoration-none text-dark d-flex justify-content-between align-items-center w-100">
                  <strong>{activo.nombre}</strong>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={(e) => {
                      e.preventDefault(); // Evita la navegación del Link
                      eliminarActivo(activo._id);
                    }}
                  >
                    Eliminar
                  </button>
                </Link>
              </li>
            ))
          ) : (
            <li className="list-group-item text-center text-muted">No se encontraron activos.</li>
          )}
        </ul>
      ) : (
        <div className="alert alert-info text-center mt-5">
          Por favor, selecciona un consorcio de la página anterior para ver sus activos.
        </div>
      )}
    </div>
  );
};

export default ActivoList;
