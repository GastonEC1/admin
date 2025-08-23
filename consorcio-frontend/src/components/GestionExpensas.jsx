import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, Plus, CheckCircle, Search, Calendar, Users, DollarSign } from 'lucide-react'; // Iconos

const API_BASE_URL = 'https://refactored-xylophone-jv659gpjqq62jqr5-5000.app.github.dev/api'; // ¡Asegúrate que esta URL sea correcta!

const GestionExpensas = () => {
    // Estado para los consorcios disponibles
    const [consorcios, setConsorcios] = useState([]);
    // Estado para el consorcio seleccionado
    const [selectedConsorcioId, setSelectedConsorcioId] = useState('');
    // Estado para las expensas del consorcio seleccionado
    const [expensas, setExpensas] = useState([]);
    // Estado para el período de generación y filtrado
    const [generatePeriodoMes, setGeneratePeriodoMes] = useState(new Date().getMonth() + 1);
    const [generatePeriodoAnio, setGeneratePeriodoAnio] = useState(new Date().getFullYear());
    // Estados para filtros
    const [filterInquilinoId, setFilterInquilinoId] = useState('');
    const [filterEstado, setFilterEstado] = useState('');
    const [inquilinosList, setInquilinosList] = useState([]); // Para el filtro por inquilino

    // Estados de UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isMarkingPaid, setIsMarkingPaid] = useState({}); // Para gestionar el estado de carga por expensa al pagar

    // Nombres de los meses y años para los selectores
    const nombresMeses = [
        { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' }, { value: 3, label: 'Marzo' },
        { value: 4, label: 'Abril' }, { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
        { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Septiembre' },
        { value: 10, label: 'Octubre' }, { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' }
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i); // Últimos 3 años, actual y próximos 3

    // Efecto para cargar los consorcios al iniciar
    useEffect(() => {
        const fetchConsorcios = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/consorcios`);
                setConsorcios(response.data);
                if (response.data.length > 0) {
                    setSelectedConsorcioId(response.data[0]._id); // Seleccionar el primer consorcio por defecto
                }
            } catch (err) {
                setError('Error al cargar los consorcios.');
                console.error('Error al cargar consorcios:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchConsorcios();
    }, []);

    // Efecto para cargar inquilinos cuando cambia el consorcio para el filtro
    useEffect(() => {
        const fetchInquilinos = async () => {
            if (!selectedConsorcioId) {
                setInquilinosList([]);
                return;
            }
            try {
                const response = await axios.get(`${API_BASE_URL}/inquilinos?consorcioId=${selectedConsorcioId}`);
                setInquilinosList(response.data);
            } catch (err) {
                console.error('Error al cargar inquilinos para el filtro:', err);
            }
        };
        fetchInquilinos();
    }, [selectedConsorcioId]);

    // Efecto para cargar las expensas cuando cambia el consorcio o los filtros
    useEffect(() => {
        const fetchExpensas = async () => {
            if (!selectedConsorcioId) {
                setExpensas([]);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const params = {
                    consorcioId: selectedConsorcioId,
                    ...(generatePeriodoMes && { periodoMes: generatePeriodoMes }), // Usamos el mismo selector para periodo de filtro
                    ...(generatePeriodoAnio && { periodoAnio: generatePeriodoAnio }), // Usamos el mismo selector para periodo de filtro
                    ...(filterInquilinoId && { inquilinoId: filterInquilinoId }),
                    ...(filterEstado && { estado: filterEstado })
                };
                const response = await axios.get(`${API_BASE_URL}/expensas`, { params });
                setExpensas(response.data);
            } catch (err) {
                setError('Error al cargar las expensas.');
                console.error('Error al cargar expensas:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchExpensas();
    }, [selectedConsorcioId, generatePeriodoMes, generatePeriodoAnio, filterInquilinoId, filterEstado]);

    // Manejar la generación de expensas
    const handleGenerateExpensas = async () => {
        if (!selectedConsorcioId || !generatePeriodoMes || !generatePeriodoAnio) {
            setMessage('Por favor, selecciona un consorcio, mes y año para generar las expensas.');
            return;
        }
        setIsGenerating(true);
        setError(null);
        setMessage('');
        try {
            const response = await axios.post(`${API_BASE_URL}/expensas/generar`, {
                consorcioId: selectedConsorcioId,
                periodoMes: parseInt(generatePeriodoMes),
                periodoAnio: parseInt(generatePeriodoAnio)
            });
            setMessage(response.data.msg || 'Expensas generadas exitosamente.');
            // Recargar las expensas después de la generación
            const params = {
                consorcioId: selectedConsorcioId,
                periodoMes: generatePeriodoMes,
                periodoAnio: generatePeriodoAnio
            };
            const updatedExpensas = await axios.get(`${API_BASE_URL}/expensas`, { params });
            setExpensas(updatedExpensas.data);

        } catch (err) {
            setError(err.response?.data?.msg || 'Error al generar las expensas.');
            console.error('Error al generar expensas:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    // Marcar expensa como pagada
    const handleMarkAsPaid = async (expensaId) => {
        if (!window.confirm('¿Estás seguro de que quieres marcar esta expensa como pagada?')) {
            return;
        }
        setIsMarkingPaid(prev => ({ ...prev, [expensaId]: true }));
        setError(null);
        setMessage('');
        try {
            const response = await axios.put(`${API_BASE_URL}/expensas/${expensaId}/pagar`);
            setExpensas(prev => prev.map(e => (e._id === expensaId ? response.data : e)));
            setMessage('Expensa marcada como pagada exitosamente.');
        } catch (err) {
            setError(err.response?.data?.msg || 'Error al marcar la expensa como pagada.');
            console.error('Error al marcar como pagada:', err);
        } finally {
            setIsMarkingPaid(prev => ({ ...prev, [expensaId]: false }));
        }
    };

    if (loading && !consorcios.length) return <div className="text-center p-4">Cargando consorcios...</div>;
    if (error && !consorcios.length) return <div className="text-center p-4 text-red-600">{error}</div>;

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Gestión de Expensas</h1>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
            {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{message}</div>}

            {/* Selector de Consorcio */}
            <div className="mb-8 p-6 bg-white rounded-lg shadow-md border border-gray-200">
                <label htmlFor="consorcio-select" className="block text-lg font-medium text-gray-700 mb-3">
                    Selecciona un Consorcio:
                </label>
                <div className="relative">
                    <select
                        id="consorcio-select"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm appearance-none bg-white border"
                        value={selectedConsorcioId}
                        onChange={(e) => setSelectedConsorcioId(e.target.value)}
                        disabled={consorcios.length === 0}
                    >
                        {consorcios.length === 0 ? (
                            <option value="">No hay consorcios disponibles</option>
                        ) : (
                            consorcios.map(consorcio => (
                                <option key={consorcio._id} value={consorcio._id}>{consorcio.nombre}</option>
                            ))
                        )}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-700">
                        <ChevronDown className="h-5 w-5" />
                    </div>
                </div>
            </div>

            {selectedConsorcioId && (
                <>
                    {/* Generar Expensas */}
                    <div className="mb-8 p-6 bg-white rounded-lg shadow-md border border-gray-200">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                            <Plus className="h-6 w-6 mr-2 text-gray-600" />
                            Generar Expensas para {consorcios.find(c => c._id === selectedConsorcioId)?.nombre}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div>
                                <label htmlFor="generatePeriodoMes" className="block text-sm font-medium text-gray-700">Mes</label>
                                <div className="relative">
                                    <select
                                        id="generatePeriodoMes"
                                        name="generatePeriodoMes"
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm appearance-none bg-white border"
                                        value={generatePeriodoMes}
                                        onChange={(e) => setGeneratePeriodoMes(e.target.value)}
                                        required
                                    >
                                        <option value="">Selecciona un mes</option>
                                        {nombresMeses.map(mes => (
                                            <option key={`gen-mes-${mes.value}`} value={mes.value}>{mes.label}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-700">
                                        <ChevronDown className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="generatePeriodoAnio" className="block text-sm font-medium text-gray-700">Año</label>
                                <div className="relative">
                                    <select
                                        id="generatePeriodoAnio"
                                        name="generatePeriodoAnio"
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm appearance-none bg-white border"
                                        value={generatePeriodoAnio}
                                        onChange={(e) => setGeneratePeriodoAnio(e.target.value)}
                                        required
                                    >
                                        <option value="">Selecciona un año</option>
                                        {years.map(year => (
                                            <option key={`gen-anio-${year}`} value={year}>{year}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-700">
                                        <ChevronDown className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleGenerateExpensas}
                                disabled={isGenerating || !selectedConsorcioId || !generatePeriodoMes || !generatePeriodoAnio}
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out md:col-span-1"
                            >
                                {isGenerating ? (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <Plus className="h-5 w-5 mr-2" />
                                )}
                                {isGenerating ? 'Generando...' : 'Generar Expensas'}
                            </button>
                        </div>
                    </div>

                    {/* Filtros de Expensas */}
                    <div className="mb-8 p-6 bg-white rounded-lg shadow-md border border-gray-200">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                            <Search className="h-6 w-6 mr-2 text-gray-600" />
                            Filtrar Expensas
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="filterInquilinoId" className="block text-sm font-medium text-gray-700">Inquilino</label>
                                <div className="relative">
                                    <select
                                        id="filterInquilinoId"
                                        name="filterInquilinoId"
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm appearance-none bg-white border"
                                        value={filterInquilinoId}
                                        onChange={(e) => setFilterInquilinoId(e.target.value)}
                                    >
                                        <option value="">Todos los inquilinos</option>
                                        {inquilinosList.map(inquilino => (
                                            <option key={`fil-inv-${inquilino._id}`} value={inquilino._id}>{inquilino.nombre} ({inquilino.unidad})</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-700">
                                        <ChevronDown className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="filterEstado" className="block text-sm font-medium text-gray-700">Estado</label>
                                <div className="relative">
                                    <select
                                        id="filterEstado"
                                        name="filterEstado"
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm appearance-none bg-white border"
                                        value={filterEstado}
                                        onChange={(e) => setFilterEstado(e.target.value)}
                                    >
                                        <option value="">Todos los estados</option>
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="Pagado">Pagado</option>
                                        <option value="Vencido">Vencido</option>
                                        <option value="Anulado">Anulado</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-700">
                                        <ChevronDown className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Listado de Expensas */}
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                        <h2 className="text-2xl font-semibold text-gray-800 p-6">Listado de Expensas</h2>
                        {loading ? (
                            <p className="p-6 text-gray-600 text-center">Cargando expensas...</p>
                        ) : expensas.length === 0 ? (
                            <p className="p-6 text-gray-600">No hay expensas registradas para este consorcio y filtros seleccionados.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inquilino</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Total</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Venc.</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {expensas.map(expensa => (
                                            <tr key={expensa._id} className={expensa.estado === 'Pagado' ? 'bg-green-50' : ''}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {nombresMeses.find(m => m.value === expensa.periodoMes)?.label} {expensa.periodoAnio}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {expensa.inquilino?.nombre} ({expensa.inquilino?.unidad})
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    ${expensa.montoTotal.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(expensa.fechaVencimiento).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        expensa.estado === 'Pagado' ? 'bg-green-100 text-green-800' :
                                                        expensa.estado === 'Pendiente' && new Date(expensa.fechaVencimiento) < new Date() ? 'bg-red-100 text-red-800' :
                                                        expensa.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {expensa.estado}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {expensa.estado === 'Pendiente' && (
                                                        <button
                                                            onClick={() => handleMarkAsPaid(expensa._id)}
                                                            className="text-green-600 hover:text-green-900 mr-3 p-1 rounded-md hover:bg-green-50 transition duration-150 ease-in-out flex items-center"
                                                            title="Marcar como Pagada"
                                                            disabled={isMarkingPaid[expensa._id]}
                                                        >
                                                            {isMarkingPaid[expensa._id] ? (
                                                                <svg className="animate-spin h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                            ) : (
                                                                <CheckCircle className="h-5 w-5" />
                                                            )}
                                                            <span>Pagar</span>
                                                        </button>
                                                    )}
                                                    {/* Opciones adicionales como "Ver Detalle" o "Enviar por Email" irían aquí */}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default GestionExpensas;