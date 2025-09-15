import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaArrowLeft,  FaPlus, FaSearch } from 'react-icons/fa';
import { Pagination } from 'react-bootstrap';

const ActivoList = () => {

  const API_BASE_URL = 'https://prueba-3-8t74.onrender.com/api';
  
  const [activos, setActivos] = useState([]);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [tipos, setTipos] = useState([]); 
  const [selectedTipo, setSelectedTipo] = useState('');
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  

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
        // Extraer y establecer los tipos únicos
        const uniqueTypes = ['Todos', ...new Set(data.map(activo => activo.tipo))];
        setTipos(uniqueTypes);
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

    const matchesSearchTerm = !searchTerm || 
      activo.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSelectedType = !selectedTipo || selectedTipo === 'Todos' ||
      activo.tipo === selectedTipo;

    return matchesSearchTerm && matchesSelectedType;
  });

  const totalPages = Math.ceil(filteredActivos.length/itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = filteredActivos.slice(startIndex, startIndex + itemsPerPage)

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
            <Link to={`/consorcios/${consorcioId}`} className="btn btn-outline-secondary">
              <FaArrowLeft className="me-2" /> Volver al Consorcio
            </Link>
          </div>
        ) : (
          <Link to="/" className="btn btn-outline-secondary">
            <FaArrowLeft className="me-2" /> Volver a Consorcios
          </Link>
        )}
      </div>
      
      {consorcioId && (
        <div className="d-flex flex-column flex-md-row mb-3">
          <div className="input-group me-md-2 mb-2 mb-md-0">
            <span className="input-group-text"><FaSearch /></span>
            <input 
              type="text"
              className="form-control"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="input-group">
            <label className="input-group-text" htmlFor="tipoFilter">Tipo</label>
            <select 
              id="tipoFilter"
              className="form-select"
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
            >
              {tipos.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {consorcioId ? (
        <ul className="list-group">
          {filteredActivos.length > 0 ? (
            currentItems.map(activo => (
              <li key={activo._id} className="list-group-item d-flex justify-content-between align-items-center">
                <Link to={`/activos/${activo._id}`} className="text-decoration-none text-dark d-flex justify-content-between align-items-center w-100">
                  <div className="d-flex flex-column">
                    <strong>{activo.nombre}</strong>
                    <small className="text-muted">Tipo: {activo.tipo}</small>
                  </div>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={(e) => {
                      e.preventDefault(); 
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
      {totalPages >1 &&(
      <div>
        <Pagination>
        <Pagination.Prev onClick={() => setCurrentPage(Math.max(1, currentPage -1 ))} disabled={currentPage ===1} />
          {Array.from({length: totalPages},(_, i) => (
            <Pagination.Item
            key={i + 1}
            active={i + 1 === currentPage}
            onClick={() => setCurrentPage(i+1)}
            >
              {i+1}
            </Pagination.Item>
          ))}
          <Pagination.Next onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}/>
          </Pagination>
      </div>
    )}
    </div>
    
  );
};

export default ActivoList;