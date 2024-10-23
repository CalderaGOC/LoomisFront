"use client";

import { useEffect, useState } from 'react';

interface Planilla {
  planilla_id: number;
  planilla: string;
  fecha_planilla: string;
  usuario: string;
}

const PlanillasPage = () => {
  const [planillas, setPlanillas] = useState<Planilla[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Límite de registros por página
  const limit = 10;

  // Función para obtener las planillas de la API usando fetch
  const fetchPlanillas = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/planillas/listar?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Error al obtener las planillas');
      }
      const data = await response.json();
      setPlanillas(data.planillas); // Asume que el backend devuelve un array de planillas
      setTotalPages(data.totalPages); // Asume que el backend también devuelve el total de páginas
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar las planillas cuando cambia la página
  useEffect(() => {
    fetchPlanillas(page);
  }, [page]);

  // Funciones de paginación
  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div>
      <h1>Lista de Planillas</h1>

      {loading ? (
        <p>Cargando planillas...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Planilla</th>
              <th>Fecha</th>
              <th>Usuario</th>
            </tr>
          </thead>
          <tbody>
            {planillas.map((planilla) => (
              <tr key={planilla.planilla_id}>
                <td>{planilla.planilla_id}</td>
                <td>{planilla.planilla}</td>
                <td>{new Date(planilla.fecha_planilla).toLocaleDateString()}</td>
                <td>{planilla.usuario}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Paginación */}
      <div>
        <button onClick={handlePreviousPage} disabled={page === 1}>
          Anterior
        </button>
        <span>Página {page} de {totalPages}</span>
        <button onClick={handleNextPage} disabled={page === totalPages}>
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default PlanillasPage;
